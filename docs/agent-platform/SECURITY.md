# Security — CloudFreedom Agent Platform

This document describes pragmatic security controls for running tenant agent workloads on a shared Coolify + Docker host.

## Threat model (MVP)

- Tenant workloads are *untrusted code* (bots/agents).
- Main risks:
  - cross-tenant data access
  - host resource exhaustion (CPU/RAM/disk)
  - accidental secret leakage
  - unintended public exposure

## Isolation & hardening (Docker/Coolify)

### Network isolation

- Each service/stack runs in its own Docker network (Coolify default behavior).
- No shared network between tenants unless explicitly required.
- Only explicitly exposed ports should be routed through Traefik.

### Resource limits

- Every template includes `deploy.resources.limits` and `reservations` (where supported).
- Default OOM handling: prefer fail-fast + restart unless the workload is batch.

### Container security

- Prefer **non-root** images and set `user:` where possible.
- Read-only filesystem for simple bots when feasible (`read_only: true`).
- Drop unnecessary Linux capabilities (`cap_drop: ["ALL"]`) for lightweight templates.

### Secrets handling

- Secrets are injected as environment variables via Coolify’s UI/API.
- Never commit tenant tokens to Git.
- Rotate secrets on compromise; log access via Admin Portal events.

### Storage

- Use volumes only when needed.
- Define retention expectations per plan.
- Backups:
  - MVP: daily backups for stateful stacks on Business+.
  - Store backups encrypted at rest.

## Access control

- Coolify access is restricted to CloudFreedom operators.
- Admin Portal controls tenant actions; operators can override.
- Provisioner uses an API token with least privilege (separate token for automation).

## Ingress security

- TLS termination via Traefik.
- Only allow domains controlled by the tenant (validated in Admin Portal).
- Rate limiting / basic WAF can be added at Traefik layer later.

## DSGVO / compliance basics

- Data processing agreements (AVV) and documentation of sub-processors.
- Logging:
  - do not log message contents by default
  - redact tokens and PII
- Data retention:
  - define default retention per plan
  - implement deletion requests through Admin Portal workflows

## Incident response (MVP)

- If a tenant stack misbehaves:
  - stop service in Coolify
  - rotate secrets
  - collect logs and timestamps
- If disk pressure:
  - identify largest volumes
  - enforce quotas; prune old images

## What we intentionally don’t do (yet)

- Kernel-level sandboxing (Kata/gVisor)
- Full SIEM integration
- Complex multi-host orchestration

The MVP security posture is: **strong defaults + tight ops discipline + clear boundaries**.
