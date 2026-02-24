import PocketBase from 'pocketbase'

// PocketBase Client
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'https://api.cloudfreedom.de')

// Enable auto cancellation for duplicated requests
pb.autoCancellation(false)

// Types
export interface User {
  id: string
  email: string
  name: string
  tenant_id: string
  product_id: string
  role: 'user' | 'tenant_admin' | 'super_admin'
  status: 'pending' | 'active' | 'suspended'
  budget_limit: number
  budget_used: number
  api_key: string
  last_login: string
  created: string
  updated: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  budget_included: number
  features: string[]
  created: string
  updated: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  domain: string
  type: 'internal' | 'demo' | 'public' | 'enterprise' | 'dev'
  status: 'active' | 'inactive' | 'pending'
  created: string
  updated: string
}

export interface UsageLog {
  id: string
  user_id: string
  model: string
  request_id: string
  tokens_input: number
  tokens_output: number
  total_tokens: number
  cost_total: number
  response_time: number
  timestamp: string
}

export interface TenantProviderKey {
  id: string
  tenant_id: string
  provider: 'google' | 'azure' | 'aws'
  provider_name: string
  api_key: string
  api_key_secondary?: string
  endpoint?: string
  region?: string
  project_id?: string
  config?: Record<string, any>
  models_enabled?: string[]
  status: 'active' | 'inactive' | 'error'
  daily_limit?: number
  monthly_budget?: number
  usage_today?: number
  usage_month?: number
  last_used?: string
  last_error?: string
  created: string
  updated: string
}

export interface AgentStack {
  id: string
  tenant_id: string
  template: 'openclaw-agent' | 'telegram-bot' | 'base-llm'
  stack_name: string
  status: 'pending' | 'deploying' | 'running' | 'stopped' | 'error'
  domain?: string
  coolify_service_uuid?: string
  env_vars?: Record<string, string>
  resource_limits?: {
    cpu: string
    memory: string
  }
  last_health_check?: string
  last_deploy?: string
  created: string
  updated: string
}

// Billing API Client
const BILLING_API_URL = import.meta.env.VITE_BILLING_API_URL || 'http://localhost:3000'

// Provisioner API Client
const PROVISIONER_API_URL = import.meta.env.VITE_PROVISIONER_API_URL || 'http://localhost:3001'

// Helper to get auth headers with PocketBase token
function getAuthHeaders() {
  const token = pb.authStore.token
  if (!token) {
    throw new Error('Not authenticated')
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export const billingAPI = {
  async checkBudget(userId: string) {
    const response = await fetch(`${BILLING_API_URL}/api/budget/check`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to check budget')
    }
    
    return response.json()
  },

  async trackUsage(data: {
    tenant_id?: string
    user_id: string
    model: string
    tokens?: number
    cost_total: number
  }) {
    const response = await fetch(`${BILLING_API_URL}/api/usage/track`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to track usage')
    }
    
    return response.json()
  },

  async getTenantUsage(tenantId: string) {
    const response = await fetch(`${BILLING_API_URL}/api/usage/tenant/${tenantId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to get tenant usage')
    }
    
    return response.json()
  },
}

// Authentication
export const auth = {
  async login(email: string, password: string) {
    return pb.collection('users').authWithPassword(email, password)
  },

  async logout() {
    pb.authStore.clear()
  },

  isAuthenticated() {
    return pb.authStore.isValid
  },

  getCurrentUser() {
    return pb.authStore.model as User | null
  },
}

// User Management
export const users = {
  async list(page = 1, perPage = 20) {
    return pb.collection('cf_users').getList<User>(page, perPage)
  },

  async getOne(id: string) {
    return pb.collection('cf_users').getOne<User>(id)
  },

  async create(data: Partial<User>) {
    return pb.collection('cf_users').create<User>(data)
  },

  async update(id: string, data: Partial<User>) {
    return pb.collection('cf_users').update<User>(id, data)
  },

  async delete(id: string) {
    return pb.collection('cf_users').delete(id)
  },

  async activate(id: string) {
    return pb.collection('cf_users').update<User>(id, { status: 'active' })
  },

  async deactivate(id: string) {
    return pb.collection('cf_users').update<User>(id, { status: 'inactive' })
  },
}

// Product Management
export const products = {
  async list() {
    return pb.collection('products').getFullList<Product>()
  },

  async getOne(id: string) {
    return pb.collection('products').getOne<Product>(id)
  },

  async create(data: Partial<Product>) {
    return pb.collection('products').create<Product>(data)
  },

  async update(id: string, data: Partial<Product>) {
    return pb.collection('products').update<Product>(id, data)
  },

  async delete(id: string) {
    return pb.collection('products').delete(id)
  },
}

// Tenant Management
export const tenants = {
  async list() {
    return pb.collection('tenants').getFullList<Tenant>()
  },

  async getOne(id: string) {
    return pb.collection('tenants').getOne<Tenant>(id)
  },

  async create(data: Partial<Tenant>) {
    return pb.collection('tenants').create<Tenant>(data)
  },

  async update(id: string, data: Partial<Tenant>) {
    return pb.collection('tenants').update<Tenant>(id, data)
  },

  async delete(id: string) {
    return pb.collection('tenants').delete(id)
  },
}

// Provider Key Management
export const providerKeys = {
  async list(tenant_id?: string) {
    const filter = tenant_id ? `tenant_id="${tenant_id}"` : ''
    return pb.collection('tenant_provider_keys').getList<TenantProviderKey>(1, 100, {
      filter,
      expand: 'tenant_id',
    })
  },

  async getOne(id: string) {
    return pb.collection('tenant_provider_keys').getOne<TenantProviderKey>(id, {
      expand: 'tenant_id',
    })
  },

  async create(data: Partial<TenantProviderKey>) {
    return pb.collection('tenant_provider_keys').create<TenantProviderKey>(data)
  },

  async update(id: string, data: Partial<TenantProviderKey>) {
    return pb.collection('tenant_provider_keys').update<TenantProviderKey>(id, data)
  },

  async delete(id: string) {
    return pb.collection('tenant_provider_keys').delete(id)
  },

  async getByTenant(tenant_id: string) {
    return pb.collection('tenant_provider_keys').getFullList<TenantProviderKey>({
      filter: `tenant_id="${tenant_id}"`,
    })
  },

  async testConnection(_id: string) {
    // This would call a backend endpoint to test the provider connection
    // For now, we just return success
    return { success: true, message: 'Connection test not yet implemented' }
  },
}

// Usage Analytics
export const analytics = {
  async getUserUsage(userId: string, _startDate: string, _endDate: string) {
    return pb.collection('usage_logs').getList<UsageLog>(1, 1000, {
      filter: `user_id = "${userId}"`,
    })
  },

  async getTotalUsage(_startDate: string, _endDate: string) {
    return pb.collection('usage_logs').getList<UsageLog>(1, 10000)
  },

  async getModelDistribution() {
    // This would need a custom API endpoint or aggregation
    // For now, fetch all and aggregate client-side
    const logs = await pb.collection('usage_logs').getFullList<UsageLog>()
    
    const distribution = logs.reduce((acc, log) => {
      acc[log.model] = (acc[log.model] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return distribution
  },
}

// Provisioner API helper
async function provisionerRequest(method: string, path: string, body?: any) {
  const headers = getAuthHeaders()
  const response = await fetch(`${PROVISIONER_API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `Provisioner error ${response.status}`)
  }
  return response.json()
}

// Agent Stack Management
export const agentStacks = {
  async list() {
    return pb.collection('agent_stacks').getFullList<AgentStack>({
      expand: 'tenant_id',
      sort: '-created'
    })
  },

  async getOne(id: string) {
    return pb.collection('agent_stacks').getOne<AgentStack>(id, {
      expand: 'tenant_id',
    })
  },

  async create(data: Partial<AgentStack>) {
    return pb.collection('agent_stacks').create<AgentStack>(data)
  },

  async update(id: string, data: Partial<AgentStack>) {
    return pb.collection('agent_stacks').update<AgentStack>(id, data)
  },

  async delete(id: string) {
    return provisionerRequest('DELETE', `/api/stacks/${id}`)
  },

  async deploy(params: {
    tenant_id: string
    template: 'openclaw-agent' | 'telegram-bot' | 'base-llm'
    stack_name: string
    domain?: string
    env_vars?: Record<string, string>
  }) {
    // Create record in PocketBase first
    const stackRecord = await pb.collection('agent_stacks').create<AgentStack>({
      tenant_id: params.tenant_id,
      template: params.template,
      stack_name: params.stack_name,
      domain: params.domain,
      config: { env_vars: params.env_vars },
      status: 'pending'
    })

    // Call provisioner to deploy via Coolify
    try {
      await provisionerRequest('POST', '/api/stacks/deploy', {
        stack_id: stackRecord.id,
      })
    } catch (error) {
      // Update status to error if provisioner call fails
      await pb.collection('agent_stacks').update(stackRecord.id, {
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Provisioner unavailable',
      })
      throw error
    }

    return stackRecord
  },

  async stop(id: string) {
    return provisionerRequest('POST', `/api/stacks/${id}/stop`)
  },

  async restart(id: string) {
    return provisionerRequest('POST', `/api/stacks/${id}/restart`)
  },

  async getLogs(id: string) {
    return provisionerRequest('GET', `/api/stacks/${id}/logs`)
  },

  async getStatus(id: string) {
    return provisionerRequest('GET', `/api/stacks/${id}/status`)
  }
}



