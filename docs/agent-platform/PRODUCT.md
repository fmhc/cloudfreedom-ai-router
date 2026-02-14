# Product Definition — CloudFreedom Agent Platform

## One-liner
**CloudFreedom Agent Platform** is a sovereign hosting layer for AI agents and chatbots that runs next to CloudFreedom’s managed LLM routing and tenant management.

## Problem
Organizations want to ship agents (support bots, Slack/Telegram assistants, automation workers, internal copilots) but:

- don’t want to maintain Kubernetes
- need predictable costs and quotas
- need DSGVO-aligned hosting and EU data residency
- need secure separation between customers/teams
- want their agents to use a governed LLM routing endpoint

## Target users

1. **SMBs / agencies** shipping bots for multiple customers.
2. **IT & security teams** who want vendor independence and operational control.
3. **Product teams** building AI-enabled features needing background workers and chat integrations.
4. **Public sector / regulated orgs** requiring EU hosting and auditable operations.

## What the platform does

- **Deploy agent stacks per tenant** using Docker Compose templates (via Coolify API)
- **Expose apps securely** behind Traefik with TLS and per-tenant domains
- **Manage tenancy and billing** through existing PocketBase + Billing API + Admin Portal
- **Provide common runtime building blocks**:
  - secrets injection
  - resource limits
  - network isolation
  - logging and health checks

## What it does *not* try to be (deliberately)

- Not a general-purpose PaaS competing with Coolify.
- Not a Kubernetes replacement.
- Not “serverless.”
- Not a “marketplace” in MVP.

## Value proposition

- **Sovereign-by-default**: agent workloads run on CloudFreedom-controlled infrastructure.
- **Faster shipping**: ready templates; one-click provisioning from existing tenant data.
- **Safer operations**: Docker-level isolation, quotas, and constrained ingress.
- **LLM governance included**: agents use CloudFreedom Router as the single egress for LLM calls.

## Core concepts

- **Tenant**: billing entity in PocketBase; maps to a Coolify project.
- **Stack**: a deployed compose bundle (one agent or one product workload).
- **Template**: versioned compose + docs; parameterized by environment variables.
- **Domain**: tenant-scoped hostname routed by Traefik.

## Primary use-cases

- Telegram/Mattermost customer support bot
- “Ops agent” polling internal APIs and triggering alerts
- Webhook-to-LLM transformer (classification, summarization)
- Per-tenant LLM gateway + UI (LiteLLM + OpenWebUI)

## Success metrics

- Time-to-deploy a new tenant stack: < 5 minutes
- Support load per tenant: low; templates are reproducible
- Incidents: no cross-tenant data leaks; resource exhaustion contained by limits
