# PocketBase Schema Extension — Agent Hosting

Neue Collections für bot_templates, bot_instances und deploy_logs.
Ergänzt die bestehenden Collections (users, tenants, products, usage).

## bot_templates

| Field | Type | Description |
|-------|------|-------------|
| name | text (required) | Template name (z.B. "OpenClaw Agent") |
| description | text | Kurzbeschreibung |
| compose_template | text (required) | Docker Compose YAML Template |
| required_secrets | json | Array von {name, description, required} |
| default_config | json | Default-Konfiguration |
| icon | text | Emoji oder Icon-URL |
| cpu_default | text | Default CPU Limit ("1.0") |
| mem_default | text | Default RAM Limit ("1G") |
| active | bool | Im Katalog sichtbar? |

## bot_instances

| Field | Type | Description |
|-------|------|-------------|
| tenant | relation (→tenants, required) | Zugehöriger Tenant |
| template | relation (→bot_templates, required) | Verwendetes Template |
| name | text (required) | Bot-Name |
| status | select (required) | pending / deploying / running / stopped / error |
| subdomain | text (required, unique) | z.B. "demo" → demo.cloudfreedom.de |
| coolify_service_id | text | Coolify Service UUID |
| coolify_project_id | text | Coolify Project UUID |
| config | json | Bot-spezifische Konfiguration |
| secrets_hash | text | Hash der gespeicherten Secrets (nicht Secrets selbst!) |
| cpu_limit | text | CPU Limit |
| mem_limit | text | RAM Limit |
| last_healthy_at | date | Letzter erfolgreicher Health Check |
| error_message | text | Letzte Fehlermeldung |

**Rules:**
- List/View: nur eigener Tenant (`@request.auth.id = tenant.user`)
- Create: authentifiziert + Tenant-Owner
- Update: nur eigener Tenant
- Delete: nur eigener Tenant

## deploy_logs

| Field | Type | Description |
|-------|------|-------------|
| instance | relation (→bot_instances, required) | Bot-Instanz |
| action | select (required) | deploy / stop / start / restart / destroy / error |
| status | select (required) | success / failed / pending |
| message | text | Log-Nachricht / Details |
| triggered_by | relation (→users) | Wer hat die Aktion ausgelöst? |
| duration_ms | number | Dauer der Aktion in ms |

**Rules:**
- List/View: nur eigener Tenant
- Create: nur System/API
