# Architecture — CloudFreedom Agent Platform

This architecture extends the existing CloudFreedom deployment on Coolify (Docker + Traefik) with a tenant-aware agent hosting layer.

## Existing components (already running)

- **Coolify** on `152.53.179.226`
  - Deploys Docker Compose stacks to the host’s Docker engine
  - Provides projects/environments/resources
- **Traefik** (existing ingress)
  - TLS termination, router rules for domains
- **PocketBase** at `https://api.cloudfreedom.de`
  - Tenants, users, subscriptions, quotas, provisioning metadata
- **Billing API** + **Admin Portal**
  - Plan management, metering hooks, lifecycle actions
- **CloudFreedom AI Router**
  - A managed LLM routing endpoint (provider selection, policies, logging)

## New components (added by this product)

### 1) Agent Templates (Docker Compose)
Versioned templates for common workloads:

- OpenClaw agent instance
- Telegram bot
- Base LLM tenant stack (LiteLLM + OpenWebUI)

Templates are designed for:

- Docker-only runtime
- Traefik labels for ingress
- resource limits
- environment-based configuration

### 2) Provisioner (CLI for MVP)
A small **Node.js/Bun** tool that uses **Coolify API** to:

- create (or reuse) a Coolify project for a tenant
- deploy a service from `docker_compose_raw`
- attach domains (Traefik routes) via Coolify service URLs / labels

In MVP, this provisioner can be invoked by an admin/operator or from the Admin Portal backend.

## Logical architecture

```text
                 +-------------------------+
                 |   Admin Portal / Billing|
                 +------------+------------+
                              |
                              | tenant lifecycle actions
                              v
+---------------------------+       +------------------------------+
| PocketBase (api.*)        |<----->| Provisioner (CLI / backend)  |
| - tenants/users/billing   |       | - Coolify API calls          |
| - stack metadata          |       | - template rendering         |
+---------------------------+       +--------------+---------------+
                                                   |
                                                   | create project + service
                                                   v
                                         +---------+----------+
                                         | Coolify (Docker)    |
                                         | - Projects          |
                                         | - Services (Compose)|
                                         +---------+----------+
                                                   |
                                                   | Docker deploy
                                                   v
                                         +---------+----------+
                                         | Docker Engine       |
                                         | (same host)         |
                                         +---------+----------+
                                                   |
                                                   v
                                        +----------+-----------+
                                        | Traefik (ingress)    |
                                        | - TLS, routing       |
                                        +----------+-----------+
                                                   |
                                                   v
                                            Public Tenant Domains
```

## Data flow (high level)

1. **Tenant is created / upgraded** in PocketBase (via Admin Portal + Billing).
2. **Provisioner** reads tenant + plan + desired template.
3. Provisioner calls **Coolify API**:
   - `POST /api/v1/projects`
   - `POST /api/v1/services` with `docker_compose_raw` and `instant_deploy=true`
4. Coolify deploys containers to Docker.
5. **Traefik** routes domains to the created services.
6. Agent workloads call **CloudFreedom AI Router** for LLM traffic.

## Isolation model (pragmatic)

- Each Coolify resource (service/stack) is deployed into its own Docker network (Coolify default).
- Cross-stack communication is disabled by default.
- Public ingress only via Traefik routers.
- Secrets are injected via Coolify environment variables.

## Observability

MVP approach:

- Use Coolify’s built-in logs + container health checks.
- Add a standard `/healthz` endpoint to agent templates.
- Optional: ship logs to a central store later (Loki/ELK) once volume justifies it.

## Why this architecture

- Uses what already exists (Coolify, Traefik, PocketBase).
- Keeps ops surface area small.
- Avoids additional provisioning services or orchestrators.
