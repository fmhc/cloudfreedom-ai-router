/**
 * Coolify API Client for CloudFreedom Provisioner
 * 
 * Handles all communication with the Coolify v4 API for deploying,
 * stopping, restarting, and managing agent stacks.
 */

export interface CoolifyConfig {
  apiUrl: string    // e.g. https://coolify.callthe.dev/api/v1
  apiToken: string  // Bearer token
  serverUuid: string // Target server UUID
  projectUuid: string // CloudFreedom project UUID
  environmentName: string // e.g. "production"
}

export interface CreateApplicationParams {
  name: string
  description?: string
  domains?: string
  dockerComposeRaw?: string
  dockerfileLocation?: string
  gitRepository?: string
  gitBranch?: string
  buildPack?: 'dockercompose' | 'dockerfile' | 'nixpacks' | 'static'
  envVars?: Record<string, string>
  instantDeploy?: boolean
}

export class CoolifyClient {
  private config: CoolifyConfig

  constructor(config: CoolifyConfig) {
    this.config = config
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const url = `${this.config.apiUrl}${path}`
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Accept': 'application/json',
    }
    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    console.log(`[Coolify] ${method} ${path}`)

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await response.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }

    if (!response.ok) {
      console.error(`[Coolify] Error ${response.status}:`, data)
      throw new Error(`Coolify API error ${response.status}: ${JSON.stringify(data)}`)
    }

    return data
  }

  /** List all applications in the project */
  async listApplications(): Promise<any[]> {
    return this.request('GET', '/applications')
  }

  /** Get application by UUID */
  async getApplication(uuid: string): Promise<any> {
    return this.request('GET', `/applications/${uuid}`)
  }

  /** Create a new docker-compose application */
  async createDockerComposeApp(params: {
    name: string
    serverUuid: string
    projectUuid: string
    environmentName: string
    dockerCompose: string
    domains?: string
    instantDeploy?: boolean
  }): Promise<any> {
    return this.request('POST', '/applications', {
      server_uuid: params.serverUuid,
      project_uuid: params.projectUuid,
      environment_name: params.environmentName,
      type: 'dockercompose',
      name: params.name,
      docker_compose_raw: params.dockerCompose,
      domains: params.domains,
      instant_deploy: params.instantDeploy ?? false,
    })
  }

  /** Create a public git-based application */
  async createPublicApp(params: {
    name: string
    serverUuid: string
    projectUuid: string
    environmentName: string
    gitRepository: string
    gitBranch?: string
    buildPack?: string
    domains?: string
    instantDeploy?: boolean
  }): Promise<any> {
    return this.request('POST', '/applications/public', {
      server_uuid: params.serverUuid,
      project_uuid: params.projectUuid,
      environment_name: params.environmentName,
      name: params.name,
      git_repository: params.gitRepository,
      git_branch: params.gitBranch || 'main',
      build_pack: params.buildPack || 'dockerfile',
      domains: params.domains,
      instant_deploy: params.instantDeploy ?? false,
    })
  }

  /** Deploy (rebuild) an application */
  async deployApplication(uuid: string): Promise<any> {
    return this.request('GET', `/applications/${uuid}/deploy`)
  }

  /** Stop an application */
  async stopApplication(uuid: string): Promise<any> {
    return this.request('GET', `/applications/${uuid}/stop`)
  }

  /** Restart an application */
  async restartApplication(uuid: string): Promise<any> {
    return this.request('GET', `/applications/${uuid}/restart`)
  }

  /** Delete an application */
  async deleteApplication(uuid: string, deleteVolumes = false): Promise<any> {
    return this.request('DELETE', `/applications/${uuid}`, {
      delete_volumes: deleteVolumes,
    })
  }

  /** Set environment variables for an application */
  async setEnvVar(uuid: string, key: string, value: string, isPreview = false): Promise<any> {
    return this.request('POST', `/applications/${uuid}/envs`, {
      key,
      value,
      is_preview: isPreview,
    })
  }

  /** Bulk set environment variables */
  async setEnvVars(uuid: string, envVars: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(envVars)) {
      await this.setEnvVar(uuid, key, value)
    }
  }

  /** Get application logs */
  async getApplicationLogs(uuid: string, lines = 100): Promise<any> {
    return this.request('GET', `/applications/${uuid}/logs?lines=${lines}`)
  }
}
