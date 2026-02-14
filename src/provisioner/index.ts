/**
 * CloudFreedom Agent Provisioner
 * 
 * REST API for managing OpenClaw bot deployments via Coolify.
 * Uses Coolify API to create/manage Docker Compose stacks per tenant.
 */

import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();
app.use("*", logger());

// --- Config ---
const COOLIFY_URL = process.env.COOLIFY_URL || "https://coolify.callthe.dev";
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN || "";
const COOLIFY_SERVER_ID = process.env.COOLIFY_SERVER_ID || "0"; // default server
const BASE_DOMAIN = process.env.BASE_DOMAIN || "cloudfreedom.de";

// --- Coolify API helpers ---
async function coolifyAPI(path: string, method = "GET", body?: any) {
  const res = await fetch(`${COOLIFY_URL}/api/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${COOLIFY_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Coolify API ${method} ${path}: ${res.status} — ${text}`);
  }
  return res.json();
}

// --- Generate Docker Compose for tenant ---
function generateCompose(tenantId: string, config: TenantConfig): string {
  return `
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: cf-agent-${tenantId}
    restart: unless-stopped
    environment:
      OPENCLAW_CONFIG: '${JSON.stringify({
        agent: { id: "main", name: config.agentName || "CloudFreedom Agent" },
        providers: {
          ...(config.anthropicKey ? { anthropic: { apiKey: config.anthropicKey } } : {}),
          ...(config.openaiKey ? { openai: { apiKey: config.openaiKey } } : {}),
          ...(config.googleKey ? { google: { apiKey: config.googleKey } } : {}),
        },
        model: config.model || "anthropic/claude-sonnet-4-20250514",
      })}'
      TELEGRAM_BOT_TOKEN: '${config.telegramToken || ""}'
      NODE_ENV: production
    volumes:
      - agent-data:/home/node/.openclaw
    deploy:
      resources:
        limits:
          cpus: "${config.cpuLimit || "1.0"}"
          memory: "${config.memLimit || "1G"}"
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.agent-${tenantId}.rule=Host(\`${tenantId}.${BASE_DOMAIN}\`)"
      - "traefik.http.routers.agent-${tenantId}.entrypoints=https"
      - "traefik.http.routers.agent-${tenantId}.tls=true"
      - "traefik.http.routers.agent-${tenantId}.tls.certresolver=letsencrypt"
      - "traefik.http.services.agent-${tenantId}.loadbalancer.server.port=18789"
    networks:
      - coolify

volumes:
  agent-data:

networks:
  coolify:
    external: true
`.trim();
}

// --- Types ---
interface TenantConfig {
  agentName?: string;
  anthropicKey?: string;
  openaiKey?: string;
  googleKey?: string;
  telegramToken?: string;
  model?: string;
  cpuLimit?: string;
  memLimit?: string;
}

interface DeployRequest {
  tenantId: string;
  config: TenantConfig;
  projectId?: string; // Coolify project UUID (optional, creates one if missing)
}

// --- Routes ---

// Health
app.get("/health", (c) => c.json({ status: "ok", service: "cloudfreedom-provisioner" }));

// Deploy a new bot instance
app.post("/api/deploy", async (c) => {
  const body = await c.req.json<DeployRequest>();
  const { tenantId, config, projectId } = body;

  if (!tenantId) return c.json({ error: "tenantId required" }, 400);

  try {
    // 1. Create or use existing Coolify project
    let projId = projectId;
    if (!projId) {
      const project = await coolifyAPI("/projects", "POST", {
        name: `agent-${tenantId}`,
        description: `CloudFreedom Agent: ${tenantId}`,
      });
      projId = project.uuid;
    }

    // 2. Get first environment of project
    const project = await coolifyAPI(`/projects/${projId}`);
    const envId = project.environments?.[0]?.id;
    if (!envId) throw new Error("No environment found in project");

    // 3. Create Docker Compose service
    const compose = generateCompose(tenantId, config);
    const service = await coolifyAPI("/services", "POST", {
      type: "docker-compose",
      name: `agent-${tenantId}`,
      description: `OpenClaw Agent for ${tenantId}`,
      project_uuid: projId,
      environment_name: "production",
      server_uuid: COOLIFY_SERVER_ID,
      docker_compose_raw: compose,
      instant_deploy: true,
    });

    return c.json({
      status: "deploying",
      tenantId,
      serviceId: service.uuid || service.id,
      projectId: projId,
      domain: `${tenantId}.${BASE_DOMAIN}`,
      message: `Agent deploying at https://${tenantId}.${BASE_DOMAIN}`,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get bot status
app.get("/api/status/:tenantId", async (c) => {
  const tenantId = c.req.param("tenantId");
  try {
    // List services, find matching one
    const services = await coolifyAPI("/services");
    const svc = services.find((s: any) => s.name === `agent-${tenantId}`);
    if (!svc) return c.json({ error: "not found" }, 404);

    return c.json({
      tenantId,
      status: svc.status,
      serviceId: svc.uuid,
      domain: `${tenantId}.${BASE_DOMAIN}`,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Stop bot
app.post("/api/stop/:tenantId", async (c) => {
  const tenantId = c.req.param("tenantId");
  try {
    const services = await coolifyAPI("/services");
    const svc = services.find((s: any) => s.name === `agent-${tenantId}`);
    if (!svc) return c.json({ error: "not found" }, 404);

    await coolifyAPI(`/services/${svc.uuid}/stop`, "POST");
    return c.json({ status: "stopped", tenantId });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Restart bot
app.post("/api/restart/:tenantId", async (c) => {
  const tenantId = c.req.param("tenantId");
  try {
    const services = await coolifyAPI("/services");
    const svc = services.find((s: any) => s.name === `agent-${tenantId}`);
    if (!svc) return c.json({ error: "not found" }, 404);

    await coolifyAPI(`/services/${svc.uuid}/restart`, "POST");
    return c.json({ status: "restarting", tenantId });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete bot
app.delete("/api/destroy/:tenantId", async (c) => {
  const tenantId = c.req.param("tenantId");
  try {
    const services = await coolifyAPI("/services");
    const svc = services.find((s: any) => s.name === `agent-${tenantId}`);
    if (!svc) return c.json({ error: "not found" }, 404);

    await coolifyAPI(`/services/${svc.uuid}`, "DELETE");
    return c.json({ status: "destroyed", tenantId });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Start ---
const port = parseInt(process.env.PORT || "3100");
console.log(`🚀 CloudFreedom Provisioner running on :${port}`);
export default { port, fetch: app.fetch };
