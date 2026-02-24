/**
 * CloudFreedom Provisioner Service
 * 
 * Bridges the Admin Portal / PocketBase with the Coolify API.
 * Handles deploying, stopping, restarting, and deleting agent stacks.
 * 
 * Runs on port 3001 (configurable via PORT env var).
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import PocketBase from 'pocketbase'
import { CoolifyClient } from './coolify'
import { getDockerCompose } from './templates'

// --- Config ---
const PORT = parseInt(process.env.PORT || '3001')
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'https://api.cloudfreedom.de'
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@cloudfreedom.de'
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || ''
const COOLIFY_API_URL = process.env.COOLIFY_API_URL || 'https://coolify.callthe.dev/api/v1'
const COOLIFY_API_TOKEN = process.env.COOLIFY_API_TOKEN || ''
const COOLIFY_SERVER_UUID = process.env.COOLIFY_SERVER_UUID || 'iskcwo008wkk4sswg80gkowo' // callthe.dev
const COOLIFY_PROJECT_UUID = process.env.COOLIFY_PROJECT_UUID || 'zot35s0wzikdrbjlaa00z0rb' // cloudfreedom
const COOLIFY_ENVIRONMENT = process.env.COOLIFY_ENVIRONMENT || 'production'
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || ''

// --- Clients ---
const coolify = new CoolifyClient({
  apiUrl: COOLIFY_API_URL,
  apiToken: COOLIFY_API_TOKEN,
  serverUuid: COOLIFY_SERVER_UUID,
  projectUuid: COOLIFY_PROJECT_UUID,
  environmentName: COOLIFY_ENVIRONMENT,
})

const pb = new PocketBase(POCKETBASE_URL)
pb.autoCancellation(false)

async function ensurePBAuth() {
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
    console.log('[PB] Authenticated as admin')
  }
}

// --- App ---
const app = new Hono()
app.use('*', cors())
app.use('*', logger())

// Auth middleware - requires either PB token or admin secret
app.use('/api/*', async (c, next) => {
  const auth = c.req.header('Authorization')
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = auth.replace('Bearer ', '')

  // Check admin secret
  if (ADMIN_SECRET && token === ADMIN_SECRET) {
    return next()
  }

  // Validate PB token
  try {
    pb.authStore.save(token, null)
    if (pb.authStore.isValid) {
      return next()
    }
  } catch {}

  return c.json({ error: 'Unauthorized' }, 401)
})

// --- Health ---
app.get('/health', (c) => c.json({ status: 'ok', service: 'cloudfreedom-provisioner' }))

// --- Deploy Stack ---
app.post('/api/stacks/deploy', async (c) => {
  const body = await c.req.json()
  const { stack_id } = body

  if (!stack_id) {
    return c.json({ error: 'stack_id required' }, 400)
  }

  try {
    await ensurePBAuth()

    // Get stack record from PocketBase
    const stack = await pb.collection('agent_stacks').getOne(stack_id)
    console.log(`[Deploy] Starting deployment for stack: ${stack.stack_name} (${stack.id})`)

    // Update status to deploying
    await pb.collection('agent_stacks').update(stack_id, { status: 'deploying' })

    // Generate docker-compose from template
    const dockerCompose = getDockerCompose(stack.template, {
      stackName: stack.stack_name,
      domain: stack.domain,
      envVars: stack.config?.env_vars || {},
    })

    // Create application in Coolify
    const coolifyApp = await coolify.createDockerComposeApp({
      name: stack.stack_name,
      serverUuid: COOLIFY_SERVER_UUID,
      projectUuid: COOLIFY_PROJECT_UUID,
      environmentName: COOLIFY_ENVIRONMENT,
      dockerCompose,
      domains: stack.domain ? `https://${stack.domain}` : undefined,
      instantDeploy: false,
    })

    const appUuid = coolifyApp.uuid
    console.log(`[Deploy] Created Coolify app: ${appUuid}`)

    // Set environment variables
    const envVars = stack.config?.env_vars || {}
    if (Object.keys(envVars).length > 0) {
      await coolify.setEnvVars(appUuid, envVars)
      console.log(`[Deploy] Set ${Object.keys(envVars).length} env vars`)
    }

    // Trigger deployment
    await coolify.deployApplication(appUuid)
    console.log(`[Deploy] Deployment triggered for ${appUuid}`)

    // Update PocketBase with Coolify UUID
    await pb.collection('agent_stacks').update(stack_id, {
      coolify_service_uuid: appUuid,
      status: 'deploying',
      last_deploy: new Date().toISOString(),
    })

    // Poll for deployment status in background
    pollDeploymentStatus(stack_id, appUuid)

    return c.json({
      success: true,
      coolify_uuid: appUuid,
      message: 'Deployment initiated',
    })
  } catch (error: any) {
    console.error('[Deploy] Error:', error.message)
    
    // Update PocketBase with error
    try {
      await ensurePBAuth()
      await pb.collection('agent_stacks').update(stack_id, {
        status: 'error',
        error_message: error.message,
      })
    } catch {}

    return c.json({ error: error.message }, 500)
  }
})

// --- Stop Stack ---
app.post('/api/stacks/:id/stop', async (c) => {
  const stackId = c.req.param('id')

  try {
    await ensurePBAuth()
    const stack = await pb.collection('agent_stacks').getOne(stackId)

    if (!stack.coolify_service_uuid) {
      return c.json({ error: 'Stack has no Coolify service UUID' }, 400)
    }

    await coolify.stopApplication(stack.coolify_service_uuid)
    await pb.collection('agent_stacks').update(stackId, { status: 'stopped' })

    return c.json({ success: true, message: 'Stack stopped' })
  } catch (error: any) {
    console.error('[Stop] Error:', error.message)
    return c.json({ error: error.message }, 500)
  }
})

// --- Restart Stack ---
app.post('/api/stacks/:id/restart', async (c) => {
  const stackId = c.req.param('id')

  try {
    await ensurePBAuth()
    const stack = await pb.collection('agent_stacks').getOne(stackId)

    if (!stack.coolify_service_uuid) {
      return c.json({ error: 'Stack has no Coolify service UUID' }, 400)
    }

    await pb.collection('agent_stacks').update(stackId, { status: 'deploying' })
    await coolify.restartApplication(stack.coolify_service_uuid)
    
    // Poll for status
    pollDeploymentStatus(stackId, stack.coolify_service_uuid)

    return c.json({ success: true, message: 'Stack restart initiated' })
  } catch (error: any) {
    console.error('[Restart] Error:', error.message)
    return c.json({ error: error.message }, 500)
  }
})

// --- Delete Stack ---
app.delete('/api/stacks/:id', async (c) => {
  const stackId = c.req.param('id')
  const deleteVolumes = c.req.query('delete_volumes') === 'true'

  try {
    await ensurePBAuth()
    const stack = await pb.collection('agent_stacks').getOne(stackId)

    // Delete from Coolify if UUID exists
    if (stack.coolify_service_uuid) {
      try {
        await coolify.deleteApplication(stack.coolify_service_uuid, deleteVolumes)
        console.log(`[Delete] Deleted Coolify app: ${stack.coolify_service_uuid}`)
      } catch (err: any) {
        console.warn(`[Delete] Coolify deletion failed (may already be deleted): ${err.message}`)
      }
    }

    // Delete from PocketBase
    await pb.collection('agent_stacks').delete(stackId)

    return c.json({ success: true, message: 'Stack deleted' })
  } catch (error: any) {
    console.error('[Delete] Error:', error.message)
    return c.json({ error: error.message }, 500)
  }
})

// --- Get Stack Status ---
app.get('/api/stacks/:id/status', async (c) => {
  const stackId = c.req.param('id')

  try {
    await ensurePBAuth()
    const stack = await pb.collection('agent_stacks').getOne(stackId)

    let coolifyStatus = null
    if (stack.coolify_service_uuid) {
      try {
        coolifyStatus = await coolify.getApplication(stack.coolify_service_uuid)
      } catch {}
    }

    return c.json({
      stack,
      coolify: coolifyStatus ? {
        status: coolifyStatus.status,
        fqdn: coolifyStatus.fqdn,
      } : null,
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// --- Get Stack Logs ---
app.get('/api/stacks/:id/logs', async (c) => {
  const stackId = c.req.param('id')
  const lines = parseInt(c.req.query('lines') || '100')

  try {
    await ensurePBAuth()
    const stack = await pb.collection('agent_stacks').getOne(stackId)

    if (!stack.coolify_service_uuid) {
      return c.json({ error: 'Stack has no Coolify service UUID' }, 400)
    }

    const logs = await coolify.getApplicationLogs(stack.coolify_service_uuid, lines)
    return c.json({ logs })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// --- List all stacks with Coolify status ---
app.get('/api/stacks', async (c) => {
  try {
    await ensurePBAuth()
    const stacks = await pb.collection('agent_stacks').getFullList()
    return c.json({ stacks })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// --- Background status polling ---
async function pollDeploymentStatus(stackId: string, coolifyUuid: string, maxAttempts = 30) {
  let attempts = 0
  const interval = setInterval(async () => {
    attempts++
    try {
      const app = await coolify.getApplication(coolifyUuid)
      const status = app.status

      if (status === 'running' || status === 'exited' || status === 'degraded') {
        await ensurePBAuth()
        await pb.collection('agent_stacks').update(stackId, {
          status: status === 'running' ? 'running' : 'error',
          error_message: status !== 'running' ? `Container status: ${status}` : '',
          last_health_check: new Date().toISOString(),
        })
        console.log(`[Poll] Stack ${stackId} status: ${status}`)
        clearInterval(interval)
        return
      }

      if (attempts >= maxAttempts) {
        await ensurePBAuth()
        await pb.collection('agent_stacks').update(stackId, {
          status: 'error',
          error_message: 'Deployment timed out after 5 minutes',
        })
        console.log(`[Poll] Stack ${stackId} timed out`)
        clearInterval(interval)
      }
    } catch (error: any) {
      console.error(`[Poll] Error checking status: ${error.message}`)
      if (attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }
  }, 10000) // Check every 10 seconds
}

// --- Start ---
console.log(`
╔══════════════════════════════════════════╗
║   CloudFreedom Provisioner v1.0         ║
║   Port: ${PORT}                            ║
║   PocketBase: ${POCKETBASE_URL}          
║   Coolify: ${COOLIFY_API_URL}            
╚══════════════════════════════════════════╝
`)

export default {
  port: PORT,
  fetch: app.fetch,
}
