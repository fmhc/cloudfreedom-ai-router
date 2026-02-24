#!/usr/bin/env node
/**
 * CloudFreedom Agent Platform - Provisioner CLI v2
 * 
 * Enhanced provisioner with PocketBase integration and full lifecycle management
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import dotenv from 'dotenv'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

dotenv.config()

// Configuration
const COOLIFY_URL = (process.env.COOLIFY_URL || '').replace(/\/+$/, '')
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN || ''
const SERVER_UUID = process.env.COOLIFY_SERVER_UUID || ''
const DESTINATION_ID = process.env.COOLIFY_DESTINATION_ID || '0'
const ENVIRONMENT_NAME = process.env.COOLIFY_ENVIRONMENT_NAME || 'production'
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'https://api.cloudfreedom.de'
const POCKETBASE_ADMIN_TOKEN = process.env.POCKETBASE_ADMIN_TOKEN || ''

// Structured logging
function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...meta
  }
  
  if (level === 'error') {
    console.error(JSON.stringify(logEntry))
  } else {
    console.log(JSON.stringify(logEntry))
  }
}

function required(name, value) {
  if (!value) {
    log('error', `Configuration missing: ${name}`, { config: name })
    throw new Error(`${name} is required`)
  }
  return value
}

function parseKeyValue(input) {
  const idx = input.indexOf('=')
  if (idx <= 0) throw new Error(`Invalid KEY=VALUE: ${input}`)
  return [input.slice(0, idx), input.slice(idx + 1)]
}

function renderTemplate(str, env) {
  // Supports: ${VAR} and ${VAR:-default}
  return str.replace(/\$\{([A-Z0-9_]+)(?::-(.*?))?\}/gi, (_, key, def) => {
    const val = env[key]
    if (val !== undefined && val !== '') return String(val)
    if (def !== undefined) return String(def)
    return ''
  })
}

class CoolifyClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
  }

  async request(method, p, body, description = '') {
    const url = `${this.baseUrl}/api/v1${p}`
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json',
    }
    let payload
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }

    log('debug', `Coolify API ${method} ${p}`, { description, url: p })

    try {
      const res = await fetch(url, { method, headers, body: payload })
      const text = await res.text()
      let json
      try {
        json = text ? JSON.parse(text) : null
      } catch {
        json = text
      }

      if (!res.ok) {
        const msg = typeof json === 'string' ? json : JSON.stringify(json)
        log('error', `Coolify API error: ${method} ${p}`, { 
          status: res.status, 
          statusText: res.statusText, 
          response: json 
        })
        throw new Error(`Coolify API error ${res.status} ${res.statusText} for ${method} ${p}: ${msg}`)
      }

      log('debug', `Coolify API success: ${method} ${p}`, { status: res.status })
      return json
    } catch (error) {
      if (error.message.includes('Coolify API error')) throw error
      log('error', 'Coolify API request failed', { error: error.message, method, path: p })
      throw new Error(`Coolify API request failed: ${error.message}`)
    }
  }

  listProjects() {
    return this.request('GET', '/projects', undefined, 'List all projects')
  }

  createProject(name, description) {
    return this.request('POST', '/projects', { name, description }, `Create project: ${name}`)
  }

  createService(payload) {
    return this.request('POST', '/services', payload, `Create service: ${payload.name}`)
  }

  getService(uuid) {
    return this.request('GET', `/services/${uuid}`, undefined, `Get service: ${uuid}`)
  }

  deleteService(uuid) {
    return this.request('DELETE', `/services/${uuid}`, undefined, `Delete service: ${uuid}`)
  }

  listServices() {
    return this.request('GET', '/services', undefined, 'List all services')
  }
}

class PocketBaseClient {
  constructor(baseUrl, adminToken) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.token = adminToken
  }

  async request(method, path, body) {
    const url = `${this.baseUrl}/api/collections${path}`
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    log('debug', `PocketBase API ${method} ${path}`)

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      })

      const result = await response.json().catch(() => ({}))
      
      if (!response.ok) {
        log('error', 'PocketBase API error', { 
          status: response.status, 
          response: result, 
          path 
        })
        throw new Error(`PocketBase API error ${response.status}: ${JSON.stringify(result)}`)
      }
      
      return result
    } catch (error) {
      if (error.message.includes('PocketBase API error')) throw error
      log('error', 'PocketBase request failed', { error: error.message, path })
      throw new Error(`PocketBase request failed: ${error.message}`)
    }
  }

  async createAgentStack(data) {
    return this.request('POST', '/agent_stacks/records', data)
  }

  async updateAgentStack(id, data) {
    return this.request('PATCH', `/agent_stacks/records/${id}`, data)
  }

  async listAgentStacks(tenantId) {
    const filter = tenantId ? `?filter=(tenant_id='${tenantId}')` : ''
    return this.request('GET', `/agent_stacks/records${filter}`)
  }

  async deleteAgentStack(id) {
    return this.request('DELETE', `/agent_stacks/records/${id}`)
  }

  async getAgentStackByName(tenantId, stackName) {
    const filter = `?filter=(tenant_id='${tenantId}' && stack_name='${stackName}')`
    const result = await this.request('GET', `/agent_stacks/records${filter}`)
    return result.items?.[0] || null
  }
}

async function ensureProject(client, projectName, description) {
  log('info', 'Ensuring project exists', { projectName })
  
  const projects = await client.listProjects()
  const existing = Array.isArray(projects)
    ? projects.find((p) => (p.name || '').toLowerCase() === projectName.toLowerCase())
    : null

  if (existing?.uuid) {
    log('info', 'Project already exists', { projectName, projectId: existing.uuid })
    return existing
  }
  
  log('info', 'Creating new project', { projectName })
  const created = await client.createProject(projectName, description)
  log('info', 'Project created', { projectName, projectId: created.uuid })
  return { uuid: created.uuid, name: projectName, description }
}

async function loadCompose(templateName) {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
  const composePath = path.join(repoRoot, 'templates', templateName, 'docker-compose.yml')
  
  log('debug', 'Loading template', { templateName, composePath })
  
  try {
    return await fs.readFile(composePath, 'utf8')
  } catch (error) {
    log('error', 'Failed to load template', { templateName, error: error.message })
    throw new Error(`Template not found: ${templateName}`)
  }
}

// Command handlers
async function deployCommand(argv) {
  const startTime = Date.now()
  
  log('info', 'Starting deployment', {
    tenant: argv.tenant,
    template: argv.template,
    stackName: argv['stack-name'],
    projectName: argv['project-name'],
    dryRun: argv['dry-run']
  })

  required('COOLIFY_URL', COOLIFY_URL)
  required('COOLIFY_TOKEN', COOLIFY_TOKEN)
  required('COOLIFY_SERVER_UUID', SERVER_UUID)
  // DESTINATION_ID ist optional, wird von Coolify automatisch ermittelt

  const envPairs = (argv.env || []).map(String).map(parseKeyValue)
  const env = Object.fromEntries(envPairs)

  // Common useful vars in templates
  env.STACK_NAME = env.STACK_NAME || String(argv['stack-name'])
  env.TENANT_ID = env.TENANT_ID || String(argv.tenant)

  const domains = (argv.domain || []).map(String).map(parseKeyValue)
  for (const [k, v] of domains) {
    // If caller provides domain mapping, also export typical vars
    if (k.toLowerCase().includes('webui')) env.WEBUI_DOMAIN = env.WEBUI_DOMAIN || v
    if (k.toLowerCase().includes('litellm')) env.LITELLM_DOMAIN = env.LITELLM_DOMAIN || v
    if (k.toLowerCase().includes('domain')) env.DOMAIN = env.DOMAIN || v
  }

  const composeRaw = await loadCompose(String(argv.template))
  const renderedCompose = renderTemplate(composeRaw, env)

  if (argv['dry-run']) {
    log('info', 'Dry-run mode - no actual deployment', {})
    console.log('--- docker_compose_raw (rendered) ---')
    console.log(renderedCompose)
    return
  }

  const coolify = new CoolifyClient(COOLIFY_URL, COOLIFY_TOKEN)
  const pocketbase = POCKETBASE_ADMIN_TOKEN ? new PocketBaseClient(POCKETBASE_URL, POCKETBASE_ADMIN_TOKEN) : null

  const projectDescription = `CloudFreedom tenant=${argv.tenant}`
  const project = await ensureProject(coolify, String(argv['project-name']), projectDescription)

  // Create PocketBase entry first (pending status)
  let agentStackRecord = null
  if (pocketbase) {
    log('info', 'Creating PocketBase record', { status: 'pending' })
    try {
      agentStackRecord = await pocketbase.createAgentStack({
        tenant_id: argv.tenant,
        template: argv.template,
        stack_name: argv['stack-name'],
        coolify_project_uuid: project.uuid,
        status: 'deploying',
        config: JSON.stringify({ env, domains }),
        resource_limits: JSON.stringify({
          cpu: env.CPU_LIMIT || '1.0',
          memory: env.MEM_LIMIT || '1G'
        })
      })
      log('info', 'PocketBase record created', { recordId: agentStackRecord.id })
    } catch (error) {
      log('warn', 'Failed to create PocketBase record', { error: error.message })
    }
  }

  // Deploy to Coolify
  try {
    const base64Compose = Buffer.from(renderedCompose, 'utf8').toString('base64')
    log('debug', 'Docker compose base64 encoded', { length: base64Compose.length, preview: base64Compose.substring(0, 100) })
    
    const servicePayload = {
      name: String(argv['stack-name']),
      description: `template=${argv.template}; tenant=${argv.tenant}`,
      project_uuid: project.uuid,
      environment_name: ENVIRONMENT_NAME,
      server_uuid: SERVER_UUID,
      // destination_id: Default wird von Coolify ermittelt
      instant_deploy: true,
      docker_compose_raw: base64Compose,
    }
    
    // Only add domain-related fields if domains are provided
    // Coolify seems to extract these from Traefik labels in docker_compose_raw
    // and explicit fields cause 422 Unprocessable Entity errors.
    // if (domains.length > 0) {
    //   const urls = domains.map(([name, url]) => ({ name, url }))
    //   servicePayload.urls = urls
    //   servicePayload.force_domain_override = true
    // }

    log('info', 'Deploying to Coolify', { serviceName: servicePayload.name })
    const created = await coolify.createService(servicePayload)

    // Update PocketBase with success
    if (pocketbase && agentStackRecord) {
      await pocketbase.updateAgentStack(agentStackRecord.id, {
        coolify_service_uuid: created.uuid,
        status: 'running',
        domain: created.domains?.[0] || '',
        updated: new Date().toISOString()
      })
      log('info', 'PocketBase record updated', { status: 'running' })
    }

    const duration = Date.now() - startTime
    log('info', 'Deployment successful', {
      projectId: project.uuid,
      serviceId: created.uuid,
      domains: created.domains,
      durationMs: duration
    })

    console.log(JSON.stringify({ 
      ok: true, 
      project_uuid: project.uuid, 
      service_uuid: created.uuid, 
      domains: created.domains,
      pocketbase_id: agentStackRecord?.id,
      duration_ms: duration
    }, null, 2))

  } catch (error) {
    // Update PocketBase with error
    if (pocketbase && agentStackRecord) {
      await pocketbase.updateAgentStack(agentStackRecord.id, {
        status: 'error',
        error_message: error.message,
        updated: new Date().toISOString()
      }).catch(() => {}) // Don't fail if PocketBase update fails
    }

    const duration = Date.now() - startTime
    log('error', 'Deployment failed', {
      error: error.message,
      durationMs: duration,
      tenant: argv.tenant,
      stackName: argv['stack-name']
    })
    throw error
  }
}

async function listCommand(argv) {
  log('info', 'Listing agent stacks', { tenant: argv.tenant })

  const coolify = new CoolifyClient(COOLIFY_URL, COOLIFY_TOKEN)
  const pocketbase = POCKETBASE_ADMIN_TOKEN ? new PocketBaseClient(POCKETBASE_URL, POCKETBASE_ADMIN_TOKEN) : null

  if (pocketbase) {
    // List from PocketBase (more detailed)
    const stacks = await pocketbase.listAgentStacks(argv.tenant)
    
    console.log(JSON.stringify({
      tenant: argv.tenant,
      total: stacks.totalItems || stacks.items?.length || 0,
      stacks: stacks.items || []
    }, null, 2))
  } else {
    // Fallback: List from Coolify and filter
    log('warn', 'No PocketBase token - listing from Coolify only')
    const services = await coolify.listServices()
    
    const tenantServices = services.filter(s => 
      s.description && s.description.includes(`tenant=${argv.tenant}`)
    )

    console.log(JSON.stringify({
      tenant: argv.tenant,
      total: tenantServices.length,
      stacks: tenantServices.map(s => ({
        name: s.name,
        uuid: s.uuid,
        status: s.status,
        created_at: s.created_at
      }))
    }, null, 2))
  }
}

async function deleteCommand(argv) {
  const startTime = Date.now()
  
  log('info', 'Deleting agent stack', {
    tenant: argv.tenant,
    stackName: argv['stack-name']
  })

  const coolify = new CoolifyClient(COOLIFY_URL, COOLIFY_TOKEN)
  const pocketbase = POCKETBASE_ADMIN_TOKEN ? new PocketBaseClient(POCKETBASE_URL, POCKETBASE_ADMIN_TOKEN) : null

  let agentStackRecord = null

  // Get PocketBase record
  if (pocketbase) {
    agentStackRecord = await pocketbase.getAgentStackByName(argv.tenant, argv['stack-name'])
    
    if (!agentStackRecord) {
      log('error', 'Stack not found in PocketBase', {
        tenant: argv.tenant,
        stackName: argv['stack-name']
      })
      throw new Error(`Stack not found: ${argv['stack-name']}`)
    }

    log('info', 'Found stack in PocketBase', {
      recordId: agentStackRecord.id,
      coolifyServiceUuid: agentStackRecord.coolify_service_uuid
    })
  }

  // Delete from Coolify
  const serviceUuid = agentStackRecord?.coolify_service_uuid
  if (serviceUuid) {
    log('info', 'Deleting from Coolify', { serviceUuid })
    await coolify.deleteService(serviceUuid)
    log('info', 'Deleted from Coolify', { serviceUuid })
  } else {
    log('warn', 'No Coolify service UUID found - skipping Coolify deletion')
  }

  // Delete from PocketBase
  if (pocketbase && agentStackRecord) {
    log('info', 'Deleting from PocketBase', { recordId: agentStackRecord.id })
    await pocketbase.deleteAgentStack(agentStackRecord.id)
    log('info', 'Deleted from PocketBase', { recordId: agentStackRecord.id })
  }

  const duration = Date.now() - startTime
  log('info', 'Deletion successful', {
    tenant: argv.tenant,
    stackName: argv['stack-name'],
    durationMs: duration
  })

  console.log(JSON.stringify({
    ok: true,
    deleted: {
      stack_name: argv['stack-name'],
      tenant: argv.tenant,
      coolify_service_uuid: serviceUuid,
      pocketbase_id: agentStackRecord?.id
    },
    duration_ms: duration
  }, null, 2))
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('provision')
    .command({
      command: 'deploy',
      describe: 'Deploy a new agent stack',
      builder: (yargs) => yargs
        .option('tenant', { type: 'string', demandOption: true, describe: 'Tenant identifier' })
        .option('project-name', { type: 'string', demandOption: true, describe: 'Coolify project name' })
        .option('template', { type: 'string', demandOption: true, choices: ['openclaw-agent', 'telegram-bot', 'base-llm', 'test-nginx', 'openclaw-simple'] })
        .option('stack-name', { type: 'string', demandOption: true, describe: 'Unique stack name' })
        .option('domain', { type: 'array', describe: 'Domain mappings (name=host)' })
        .option('env', { type: 'array', describe: 'Environment variables (KEY=VALUE)' })
        .option('dry-run', { type: 'boolean', default: false }),
      handler: deployCommand
    })
    .command({
      command: 'list',
      describe: 'List agent stacks for a tenant',
      builder: (yargs) => yargs
        .option('tenant', { type: 'string', demandOption: true, describe: 'Tenant identifier' }),
      handler: listCommand
    })
    .command({
      command: 'delete',
      describe: 'Delete an agent stack',
      builder: (yargs) => yargs
        .option('tenant', { type: 'string', demandOption: true, describe: 'Tenant identifier' })
        .option('stack-name', { type: 'string', demandOption: true, describe: 'Stack name to delete' }),
      handler: deleteCommand
    })
    .demandCommand(1, 'You need to specify a command')
    .help()
    .parse()
}

main().catch((err) => {
  log('error', 'Command failed', { 
    error: err.message, 
    stack: err.stack,
    command: process.argv.slice(2).join(' ')
  })
  process.exit(1)
})