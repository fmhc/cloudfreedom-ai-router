# PocketBase Schema Extension — Agent Platform MVP

Erweitert das bestehende PocketBase Schema für CloudFreedom Agent Hosting.

## agent_stacks (neue Collection)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | text | ✅ | Auto-generated ID |
| tenant_id | relation | ✅ | Relation zu tenants Collection |
| template | select | ✅ | openclaw-agent / telegram-bot / base-llm |
| stack_name | text | ✅ | Name des Coolify Service (unique pro tenant) |
| coolify_project_uuid | text |  | UUID des Coolify Projekts |
| coolify_service_uuid | text |  | UUID des Coolify Service |
| domain | text |  | Zugewiesene Domain (z.B. demo.cloudfreedom.de) |
| status | select | ✅ | pending / deploying / running / stopped / error |
| created_at | date | ✅ | Auto-generated |
| updated_at | date | ✅ | Auto-generated |
| config | json |  | Template-spezifische Konfiguration |
| resource_limits | json |  | CPU/Memory Limits |
| last_health_check | date |  | Letzter Health Check |
| error_message | text |  | Letzte Fehlermeldung |

**API Rules:**
```javascript
// List/View: nur eigene Stacks
@request.auth.id = tenant_id.user_id

// Create: authentifiziert + Tenant-Owner + Limits prüfen
@request.auth.id = tenant_id.user_id && 
@collection.agent_stacks.tenant_id.id ?= tenant_id.id.count() < tenant_id.max_stacks

// Update: nur eigene Stacks
@request.auth.id = tenant_id.user_id

// Delete: nur eigene Stacks  
@request.auth.id = tenant_id.user_id
```

## tenants Collection (erweitert)

Neue Felder hinzufügen:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| max_stacks | number | 1 | Maximale Anzahl Agent Stacks |
| plan_tier | select | starter | starter / team / business / sovereign |

**Plan Tier Limits:**
- **starter**: 1-2 stacks, 0.25 CPU, 256MB RAM
- **team**: 10 stacks, 0.5 CPU, 512MB RAM  
- **business**: 25 stacks, 1.0 CPU, 1GB RAM
- **sovereign**: unbegrenzt, custom resources

## Migration SQL

```sql
-- Erweitere tenants Tabelle
ALTER TABLE tenants ADD COLUMN max_stacks INTEGER DEFAULT 1;
ALTER TABLE tenants ADD COLUMN plan_tier TEXT DEFAULT 'starter';

-- Erstelle agent_stacks Tabelle
CREATE TABLE agent_stacks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    template TEXT NOT NULL CHECK (template IN ('openclaw-agent', 'telegram-bot', 'base-llm')),
    stack_name TEXT NOT NULL,
    coolify_project_uuid TEXT,
    coolify_service_uuid TEXT,
    domain TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'running', 'stopped', 'error')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    config JSON,
    resource_limits JSON,
    last_health_check DATETIME,
    error_message TEXT,
    UNIQUE(tenant_id, stack_name)
);

-- Index für Performance
CREATE INDEX idx_agent_stacks_tenant ON agent_stacks(tenant_id);
CREATE INDEX idx_agent_stacks_status ON agent_stacks(status);
```

## PocketBase Collections JSON

Die Collections können auch über die PocketBase Admin UI oder programmatisch erstellt werden:

```json
{
  "name": "agent_stacks",
  "schema": [
    {"name": "tenant_id", "type": "relation", "required": true, "options": {"collectionId": "tenants", "cascadeDelete": true}},
    {"name": "template", "type": "select", "required": true, "options": {"values": ["openclaw-agent", "telegram-bot", "base-llm"]}},
    {"name": "stack_name", "type": "text", "required": true},
    {"name": "coolify_project_uuid", "type": "text"},
    {"name": "coolify_service_uuid", "type": "text"},
    {"name": "domain", "type": "text"},
    {"name": "status", "type": "select", "required": true, "options": {"values": ["pending", "deploying", "running", "stopped", "error"]}},
    {"name": "config", "type": "json"},
    {"name": "resource_limits", "type": "json"},
    {"name": "last_health_check", "type": "date"},
    {"name": "error_message", "type": "text"}
  ]
}
```

## Implementation Notes

1. **tenant_id.max_stacks** wird verwendet, um Provisionierungs-Limits zu erzwingen
2. **stack_name** muss unique pro tenant sein (für predictable naming)
3. **coolify_*_uuid** werden nach erfolgreichem Deploy gesetzt
4. **status** lifecycle: pending → deploying → running (oder error)
5. **resource_limits** als JSON für Template-spezifische CPU/RAM Einstellungen