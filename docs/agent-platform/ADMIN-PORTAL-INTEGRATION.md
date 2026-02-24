# Admin Portal Integration - Agent Stacks View

## Current Admin Portal Status
Das Admin Portal (`admin-portal/`) ist ein React + TypeScript + Tailwind-Projekt mit:
- ✅ PocketBase Integration (pb.authStore)
- ✅ Tenant-Management (TenantsList.tsx)  
- ✅ User-Management
- ✅ Products + Provider Keys
- ✅ Modern UI Components (shadcn/ui)

## Proposed Agent Stacks Integration

### 1. New Tab in Dashboard
Erweitere `Dashboard.tsx`:
```typescript
const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: Activity },
  { id: 'users' as TabType, label: 'Users', icon: Users },
  { id: 'tenants' as TabType, label: 'Tenants', icon: Building2 },
  { id: 'products' as TabType, label: 'Products', icon: Package },
  { id: 'providers' as TabType, label: 'Provider Keys', icon: Key },
  { id: 'agents' as TabType, label: 'Agent Stacks', icon: Bot }, // NEW
]
```

### 2. AgentStacksList Component
```typescript
// src/components/agents/AgentStacksList.tsx
interface AgentStack {
  id: string
  tenant_id: string
  template: 'openclaw-agent' | 'telegram-bot' | 'base-llm'
  stack_name: string
  status: 'pending' | 'deploying' | 'running' | 'stopped' | 'error'
  domain?: string
  coolify_service_uuid?: string
  created: string
  last_health_check?: string
  resource_limits?: {cpu: string, memory: string}
}

export function AgentStacksList() {
  const [stacks, setStacks] = useState<AgentStack[]>([])
  
  // PocketBase query: SELECT * FROM agent_stacks
  const loadStacks = async () => {
    const data = await pb.collection('agent_stacks').getFullList()
    setStacks(data)
  }
  
  // Render table with tenant filter, status badges, actions
}
```

### 3. Stack Management Actions
```typescript
const actions = {
  // Via Provisioner CLI API calls
  deployStack: (tenant: string, template: string, name: string) => {},
  deleteStack: (tenant: string, name: string) => {},
  restartStack: (serviceUuid: string) => {},
  viewLogs: (serviceUuid: string) => {},
}
```

### 4. UI Mock-up

```
┌─ CloudFreedom Admin ─────────────────────────┐
│ Overview | Users | Tenants | Products | [Agent Stacks] │
├─────────────────────────────────────────────┤
│ Agent Stacks Management                     │
│                                             │
│ ┌─ Filters ────────────────────────────┐    │
│ │ Tenant: [All ▼] Status: [All ▼]     │    │
│ │ Template: [All ▼] [+ New Stack]     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Stack Name    │ Tenant    │ Template │ Status │ Domain │ Actions      │
│ ────────────────────────────────────────────────────────────────────│
│ test-bot-01   │ acme-inc  │ telegram │ 🟢 Running │ test-bot.cf.de │ [Logs] [⚙️] [🗑️] │
│ agent-main    │ startup-x │ openclaw │ 🟡 Pending │ -              │ [Logs] [⚙️] [🗑️] │
│ llm-gateway   │ bigcorp   │ base-llm │ 🔴 Error   │ -              │ [Logs] [⚙️] [🗑️] │
```

### 5. Implementation Steps

#### Phase 1: Basic View (1-2 hours)
1. Add Agent Stacks tab to Dashboard
2. Create AgentStacksList component  
3. PocketBase collection query
4. Basic table with status badges

#### Phase 2: Stack Actions (2-3 hours)  
1. "New Stack" dialog (tenant, template, name selection)
2. Delete confirmation dialog
3. Provisioner CLI integration (API calls)
4. Real-time status updates

#### Phase 3: Advanced Features (3-4 hours)
1. Container logs viewer (modal)
2. Resource usage metrics  
3. Health check monitoring
4. Bulk operations (start/stop/delete multiple)

### 6. API Integration Pattern
```typescript
// src/lib/provisioner.ts
class ProvisionerAPI {
  private baseUrl = '/api/provisioner' // Via proxy or direct CLI calls
  
  async deployStack(params: {
    tenant: string
    projectName: string  
    template: string
    stackName: string
    env?: Record<string, string>
  }) {
    // Call provisioner CLI or API endpoint
    return fetch(`${this.baseUrl}/deploy`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params)
    })
  }
  
  async listStacks(tenant?: string) {
    const url = tenant ? `${this.baseUrl}/list?tenant=${tenant}` : `${this.baseUrl}/list`
    return fetch(url).then(r => r.json())
  }
}
```

## Benefits

### For Operators
- 📊 **Centralized View:** All agent stacks in one dashboard
- 🔍 **Tenant Filtering:** Easy tenant-specific management
- 📈 **Status Monitoring:** Real-time health + resource usage
- ⚡ **Quick Actions:** Deploy/restart/delete via UI

### For CloudFreedom Business
- 🎯 **Customer Self-Service:** (Future) Tenant portal integration
- 📋 **Operations Efficiency:** No CLI needed for routine tasks
- 🔒 **Audit Trail:** All actions logged in PocketBase  
- 📊 **Usage Analytics:** Stack deployment trends, resource consumption

## Next Steps

1. **PocketBase Schema:** Fix SSL issues, deploy agent_stacks collection
2. **Basic Integration:** Add Agent Stacks tab + table view
3. **CLI Bridge:** Create API layer for provisioner CLI calls
4. **Production Polish:** Error handling, loading states, confirmations

**Estimated Implementation Time:** 6-8 hours for full-featured integration

---
*Skizze erstellt: 2026-02-16 nach erfolgreichem Live-Deployment Test*