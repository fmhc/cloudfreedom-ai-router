# Integration — CloudFreedom Router + Agent Hosting

This document describes how the **existing CloudFreedom stack** integrates with the new agent hosting capabilities.

## System boundaries

- **PocketBase (api.cloudfreedom.de)** remains the system of record for:
  - tenants, users, roles
  - subscription plan / billing status
  - allowed templates, quotas, lifecycle
- **Coolify** is the runtime orchestrator for Docker Compose stacks.
- **Traefik** is the shared ingress.
- **CloudFreedom AI Router** is the governed LLM egress endpoint for all agent workloads.

## Tenant → Coolify mapping

| PocketBase | Coolify |
|---|---|
| `tenant.id` | `project.name` / tag prefix |
| plan + quotas | CPU/RAM limits + max stacks |
| `tenant.domain` | service URL(s) and Traefik routers |

Recommendation:

- One **Coolify Project per tenant** (keeps ownership, access, and listing clear).
- One **Service per agent stack** (compose stack as a service).

## Provisioning lifecycle

### Create tenant

1. Admin Portal creates tenant in PocketBase.
2. Provisioner creates Coolify project: `POST /api/v1/projects`.
3. Store resulting `project_uuid` back into PocketBase.

### Deploy a stack

1. Operator/admin selects template + parameters.
2. Provisioner renders compose template with variables.
3. Provisioner creates Coolify service: `POST /api/v1/services`.
4. Store resulting `service_uuid`, domain(s), and template version in PocketBase.

### Suspend / delete

- Suspends can be implemented as:
  - stop service in Coolify (API), and/or
  - rotate secrets / disable ingress (remove domains)
- Deletions:
  - delete service in Coolify
  - remove metadata in PocketBase

(Deletion should be a deliberate action with retention rules; see `docs/SECURITY.md`.)

## LLM usage integration

Agent templates should route LLM requests to CloudFreedom Router:

- `CLOUDFREEDOM_ROUTER_BASE_URL=https://router.cloudfreedom.de`
- `CLOUDFREEDOM_API_KEY=...` (per tenant / per stack)

Benefits:

- consistent policy enforcement
- provider failover
- unified logs for compliance

## Billing integration

MVP billing model:

- Plan gates number of stacks and resource ceilings.
- Optional metering later (token usage, egress, storage).

Where to enforce:

- **Before provisioning**: Admin Portal checks plan limits in PocketBase.
- **At runtime**: Docker resource limits on services.

## Networking integration

- Traefik is shared.
- Each tenant stack exposes only required ports.
- Internal-only services should not have Traefik labels.

## Source of truth fields (suggested)

Add to PocketBase collections (conceptually):

- `tenants.coolify_project_uuid`
- `stacks.tenant_id`
- `stacks.coolify_service_uuid`
- `stacks.template`
- `stacks.template_version`
- `stacks.domains[]`
- `stacks.status`
