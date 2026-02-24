#!/usr/bin/env node
/**
 * CloudFreedom Agent Platform - PocketBase Schema Setup
 * 
 * Erweitert PocketBase um agent_stacks Collection und tenants Felder
 * Läuft gegen api.cloudfreedom.de
 */

import fs from 'node:fs/promises'

const POCKETBASE_URL = 'https://api.cloudfreedom.de'
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@cloudfreedom.de'  
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD

if (!ADMIN_PASSWORD) {
  console.error('❌ PB_ADMIN_PASSWORD environment variable required')
  process.exit(1)
}

class PocketBaseAdmin {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.token = null
  }

  async request(method, path, body) {
    const url = `${this.baseUrl}/api${path}`
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    const result = await response.json().catch(() => ({}))
    
    if (!response.ok) {
      throw new Error(`PocketBase API error ${response.status}: ${JSON.stringify(result)}`)
    }
    
    return result
  }

  async authenticate() {
    console.log('🔐 Authenticating with PocketBase...')
    const auth = await this.request('POST', '/admins/auth-with-password', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
    
    this.token = auth.token
    console.log('✅ Authenticated successfully')
  }

  async getCollections() {
    return this.request('GET', '/collections')
  }

  async createCollection(data) {
    return this.request('POST', '/collections', data)
  }

  async updateCollection(id, data) {
    return this.request('PATCH', `/collections/${id}`, data)
  }

  async getCollection(name) {
    const collections = await this.getCollections()
    return collections.items?.find(c => c.name === name)
  }
}

async function main() {
  const pb = new PocketBaseAdmin(POCKETBASE_URL)
  
  try {
    await pb.authenticate()

    // 1. Extend tenants collection with max_stacks and plan_tier
    console.log('\\n📋 Extending tenants collection...')
    const tenantsCollection = await pb.getCollection('tenants')
    
    if (!tenantsCollection) {
      console.error('❌ tenants collection not found!')
      process.exit(1)
    }

    const tenantsSchema = [...tenantsCollection.schema]
    
    // Add max_stacks field if not exists
    if (!tenantsSchema.find(f => f.name === 'max_stacks')) {
      tenantsSchema.push({
        name: 'max_stacks',
        type: 'number',
        required: false,
        options: {
          min: 0,
          max: 1000
        }
      })
      console.log('  + Added max_stacks field')
    }

    // Add plan_tier field if not exists
    if (!tenantsSchema.find(f => f.name === 'plan_tier')) {
      tenantsSchema.push({
        name: 'plan_tier',
        type: 'select',
        required: false,
        options: {
          maxSelect: 1,
          values: ['starter', 'team', 'business', 'sovereign']
        }
      })
      console.log('  + Added plan_tier field')
    }

    await pb.updateCollection(tenantsCollection.id, {
      schema: tenantsSchema
    })
    console.log('✅ tenants collection updated')

    // 2. Create agent_stacks collection
    console.log('\\n🤖 Creating agent_stacks collection...')
    const agentStacksCollection = await pb.getCollection('agent_stacks')
    
    if (agentStacksCollection) {
      console.log('⚠️  agent_stacks collection already exists')
    } else {
      const agentStacksSchema = [
        {
          name: 'tenant_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: tenantsCollection.id,
            cascadeDelete: true,
            minSelect: null,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'template',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['openclaw-agent', 'telegram-bot', 'base-llm']
          }
        },
        {
          name: 'stack_name',
          type: 'text',
          required: true,
          options: {
            min: null,
            max: null,
            pattern: ''
          }
        },
        {
          name: 'coolify_project_uuid',
          type: 'text',
          required: false,
          options: {
            min: null,
            max: null,
            pattern: ''
          }
        },
        {
          name: 'coolify_service_uuid',
          type: 'text',
          required: false,
          options: {
            min: null,
            max: null,
            pattern: ''
          }
        },
        {
          name: 'domain',
          type: 'text',
          required: false,
          options: {
            min: null,
            max: null,
            pattern: ''
          }
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['pending', 'deploying', 'running', 'stopped', 'error']
          }
        },
        {
          name: 'config',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'resource_limits',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'last_health_check',
          type: 'date',
          required: false,
          options: {
            min: '',
            max: ''
          }
        },
        {
          name: 'error_message',
          type: 'text',
          required: false,
          options: {
            min: null,
            max: null,
            pattern: ''
          }
        }
      ]

      await pb.createCollection({
        name: 'agent_stacks',
        type: 'base',
        schema: agentStacksSchema,
        listRule: '@request.auth.id = tenant_id.user_id',
        viewRule: '@request.auth.id = tenant_id.user_id',
        createRule: '@request.auth.id = tenant_id.user_id',
        updateRule: '@request.auth.id = tenant_id.user_id',
        deleteRule: '@request.auth.id = tenant_id.user_id',
        options: {}
      })
      
      console.log('✅ agent_stacks collection created')
    }

    console.log('\\n🎉 PocketBase schema setup completed!')
    console.log('\\n📊 Collections summary:')
    const collections = await pb.getCollections()
    collections.items?.forEach(c => {
      if (['tenants', 'agent_stacks'].includes(c.name)) {
        console.log(`  - ${c.name}: ${c.schema.length} fields`)
      }
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}