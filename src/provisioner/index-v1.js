import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import dotenv from 'dotenv'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

dotenv.config()

const COOLIFY_URL = (process.env.COOLIFY_URL || '').replace(/\/+$/, '')
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN || ''
const SERVER_UUID = process.env.COOLIFY_SERVER_UUID || ''
const DESTINATION_UUID = process.env.COOLIFY_DESTINATION_UUID || ''
const ENVIRONMENT_NAME = process.env.COOLIFY_ENVIRONMENT_NAME || 'production'

function required(name, value) {
  if (!value) throw new Error(`${name} is required`)
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

  async request(method, p, body) {
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
      throw new Error(`Coolify API error ${res.status} ${res.statusText} for ${method} ${p}: ${msg}`)
    }

    return json
  }

  listProjects() {
    return this.request('GET', '/projects')
  }

  createProject(name, description) {
    return this.request('POST', '/projects', { name, description })
  }

  createService(payload) {
    return this.request('POST', '/services', payload)
  }
}

async function ensureProject(client, projectName, description) {
  const projects = await client.listProjects()
  const existing = Array.isArray(projects)
    ? projects.find((p) => (p.name || '').toLowerCase() === projectName.toLowerCase())
    : null

  if (existing?.uuid) return existing
  const created = await client.createProject(projectName, description)
  return { uuid: created.uuid, name: projectName, description }
}

async function loadCompose(templateName) {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
  const composePath = path.join(repoRoot, 'templates', templateName, 'docker-compose.yml')
  return fs.readFile(composePath, 'utf8')
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('provision')
    .option('tenant', { type: 'string', demandOption: true, describe: 'Tenant identifier (used for description/labels)' })
    .option('project-name', { type: 'string', demandOption: true, describe: 'Coolify project name (one project per tenant)' })
    .option('template', { type: 'string', demandOption: true, choices: ['openclaw-agent', 'telegram-bot', 'base-llm'] })
    .option('stack-name', { type: 'string', demandOption: true, describe: 'Coolify service name' })
    .option('domain', { type: 'array', describe: 'Domain mapping like name=host (repeatable). Example: webui=ui.example.com' })
    .option('env', { type: 'array', describe: 'Environment variables KEY=VALUE (repeatable)' })
    .option('dry-run', { type: 'boolean', default: false })
    .help()
    .parse()

  required('COOLIFY_URL', COOLIFY_URL)
  required('COOLIFY_TOKEN', COOLIFY_TOKEN)
  required('COOLIFY_SERVER_UUID', SERVER_UUID)
  required('COOLIFY_DESTINATION_UUID', DESTINATION_UUID)

  const envPairs = (argv.env || []).map(String).map(parseKeyValue)
  const env = Object.fromEntries(envPairs)

  // Common useful vars in templates
  env.STACK_NAME = env.STACK_NAME || String(argv['stack-name'])

  const domains = (argv.domain || []).map(String).map(parseKeyValue)
  for (const [k, v] of domains) {
    // If caller provides domain mapping, also export typical vars
    if (k.toLowerCase().includes('webui')) env.WEBUI_DOMAIN = env.WEBUI_DOMAIN || v
    if (k.toLowerCase().includes('litellm')) env.LITELLM_DOMAIN = env.LITELLM_DOMAIN || v
    if (k.toLowerCase().includes('domain')) env.DOMAIN = env.DOMAIN || v
  }

  const composeRaw = await loadCompose(String(argv.template))
  const renderedCompose = renderTemplate(composeRaw, env)

  const client = new CoolifyClient(COOLIFY_URL, COOLIFY_TOKEN)

  const projectDescription = `CloudFreedom tenant=${argv.tenant}`

  if (argv['dry-run']) {
    console.log('[dry-run] would ensure project:', argv['project-name'])
    console.log('[dry-run] would deploy service:', argv['stack-name'])
    console.log('--- docker_compose_raw (rendered) ---')
    console.log(renderedCompose)
    return
  }

  const project = await ensureProject(client, String(argv['project-name']), projectDescription)

  const urls = domains.map(([name, url]) => ({ name, url }))

  const servicePayload = {
    type: 'custom',
    name: String(argv['stack-name']),
    description: `template=${argv.template}; tenant=${argv.tenant}`,
    project_uuid: project.uuid,
    environment_name: ENVIRONMENT_NAME,
    server_uuid: SERVER_UUID,
    destination_uuid: DESTINATION_UUID,
    instant_deploy: true,
    docker_compose_raw: renderedCompose,
    urls,
    force_domain_override: true,
  }

  const created = await client.createService(servicePayload)
  console.log(JSON.stringify({ ok: true, project_uuid: project.uuid, service_uuid: created.uuid, domains: created.domains }, null, 2))
}

main().catch((err) => {
  console.error(err?.stack || String(err))
  process.exit(1)
})
