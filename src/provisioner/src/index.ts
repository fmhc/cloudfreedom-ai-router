import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { loadEnv } from "./env";
import { CoolifyClient } from "./coolify";
import { createLogger } from "./logger";
import {
  createPb,
  pbAdminAuth,
  pbGetCoolifyToken,
  pbGetOrCreateBotTemplate,
  pbLog,
  pbUpsertBotInstance,
} from "./pocketbase";
import { base64Compose, renderComposeTemplate } from "./template";

const env = loadEnv();
const log = createLogger(env);

const repoRoot = process.cwd().includes("src/provisioner")
  ? process.cwd().replace(/\/src\/provisioner$/, "")
  : process.cwd();

const pb = createPb(env);
if (pb) {
  await pbAdminAuth(pb, env);
  log.info({ pocketbase: env.POCKETBASE_URL }, "PocketBase admin auth OK");
}

async function getCoolifyClient() {
  let token = env.COOLIFY_API_TOKEN;
  if (!token) {
    if (!pb) throw new Error("COOLIFY_API_TOKEN not set and PocketBase not configured.");
    token = await pbGetCoolifyToken(pb, env.COOLIFY_TOKEN_NAME);
  }
  return new CoolifyClient(env.COOLIFY_BASE_URL, token);
}

function tenantToSubdomain(tenantId: string) {
  // Keep it DNS-safe.
  const slug = tenantId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `${slug}.${env.BOT_DOMAIN_BASE}`;
}

const app = new Hono();
app.use("*", cors());
app.use("*", prettyJSON());

app.get("/health", (c) => c.json({ ok: true }));

app.post("/api/tenants/:id/deploy", async (c) => {
  const tenantId = c.req.param("id");
  const subdomain = tenantToSubdomain(tenantId);

  const body = (await c.req.json().catch(() => ({}))) as {
    config?: unknown;
    secrets?: {
      ANTHROPIC_API_KEY?: string;
      OPENAI_API_KEY?: string;
      TELEGRAM_BOT_TOKEN?: string;
      AUTH_USERNAME?: string;
      AUTH_PASSWORD?: string;
      OPENCLAW_GATEWAY_TOKEN?: string;
      OPENCLAW_CONFIG?: string;
    };
  };

  const coolify = await getCoolifyClient();

  const templateYaml = await renderComposeTemplate({
    repoRoot,
    templatePath: env.OPENCLAW_TEMPLATE_PATH,
    tenantId,
    subdomain,
    traefikNetwork: env.TRAEFIK_NETWORK,
  });

  // Coolify expects base64 encoded docker_compose_raw.
  const docker_compose_raw = base64Compose(templateYaml);

  // Ensure project exists (by deterministic name).
  const projectName = `cf-tenant-${tenantId}`;
  const projects = await coolify.listProjects();
  let project = projects.find((p) => p.name === projectName);
  if (!project) {
    const created = await coolify.createProject({
      name: projectName,
      description: `CloudFreedom tenant ${tenantId} agents`,
    });
    project = { id: -1, uuid: created.uuid, name: projectName, description: null };
  }

  // Create Coolify service.
  // Note: type is a string; Coolify accepts "docker-compose" for custom raw compose services.
  const serviceName = `openclaw-${tenantId}`;

  const created = await coolify.createService({
    type: "docker-compose",
    name: serviceName,
    description: `OpenClaw agent gateway for tenant ${tenantId}`,
    project_uuid: project.uuid,
    environment_name: env.COOLIFY_ENVIRONMENT_NAME,
    server_uuid: env.COOLIFY_SERVER_UUID,
    destination_uuid: env.COOLIFY_DESTINATION_UUID,
    instant_deploy: env.AUTO_DEPLOY,
    docker_compose_raw,
    urls: [{ name: "ui", url: `https://${subdomain}` }],
    force_domain_override: true,
  });

  // Explicit deploy (Coolify queues it).
  if (env.AUTO_DEPLOY) {
    await coolify.deployByUuid(created.uuid, { force: true });
  }

  // Persist to PocketBase if available.
  if (pb) {
    const template = await pbGetOrCreateBotTemplate(pb, {
      name: "openclaw-agent",
      description: "OpenClaw gateway + UI behind Traefik",
      compose_template: templateYaml,
      required_secrets: [
        "ANTHROPIC_API_KEY",
        "OPENAI_API_KEY",
        "TELEGRAM_BOT_TOKEN",
        "AUTH_PASSWORD",
      ],
      default_config: body.config ?? {},
    });

    const instance = await pbUpsertBotInstance(pb, {
      tenant_id: tenantId,
      template_id: template.id,
      subdomain,
      status: "deploying",
      coolify_app_id: created.uuid,
      config: body.config ?? {},
    });

    await pbLog(pb, {
      instance_id: instance.id,
      action: "deploy",
      status: "success",
      message: `Created Coolify service ${created.uuid} (${serviceName})`,
    });
  }

  log.info({ tenantId, subdomain, coolifyServiceUuid: created.uuid }, "Deploy queued");

  return c.json({
    tenantId,
    status: "deploying",
    url: `https://${subdomain}`,
    coolify: { service_uuid: created.uuid },
  });
});

async function resolveServiceUuid(tenantId: string, queryUuid?: string) {
  if (queryUuid) return queryUuid;
  if (!pb) return null;

  try {
    const inst = await pb
      .collection("bot_instances")
      .getFirstListItem<{ coolify_app_id?: string }>(
        `tenant_id="${tenantId}" && status!="error"`,
      );
    return inst.coolify_app_id ?? null;
  } catch {
    return null;
  }
}

app.get("/api/tenants/:id/status", async (c) => {
  const tenantId = c.req.param("id");
  const coolify = await getCoolifyClient();

  const serviceUuid = await resolveServiceUuid(tenantId, c.req.query("service_uuid"));
  if (!serviceUuid) {
    return c.json(
      {
        error:
          "Missing service_uuid query param and no bot_instances record found in PocketBase.",
      },
      400,
    );
  }

  const service = await coolify.getService(serviceUuid);
  return c.json({ tenantId, serviceUuid, service });
});

app.post("/api/tenants/:id/stop", async (c) => {
  const tenantId = c.req.param("id");
  const serviceUuid = await resolveServiceUuid(tenantId, c.req.query("service_uuid"));
  if (!serviceUuid) return c.json({ error: "Missing service_uuid" }, 400);

  const coolify = await getCoolifyClient();
  const res = await coolify.stopService(serviceUuid);
  return c.json({ ok: true, serviceUuid, ...res });
});

app.post("/api/tenants/:id/restart", async (c) => {
  const tenantId = c.req.param("id");
  const serviceUuid = await resolveServiceUuid(tenantId, c.req.query("service_uuid"));
  if (!serviceUuid) return c.json({ error: "Missing service_uuid" }, 400);

  const latest = c.req.query("latest") === "true";
  const coolify = await getCoolifyClient();
  const res = await coolify.restartService(serviceUuid, { latest });
  return c.json({ ok: true, serviceUuid, ...res });
});

app.delete("/api/tenants/:id", async (c) => {
  const tenantId = c.req.param("id");
  const serviceUuid = await resolveServiceUuid(tenantId, c.req.query("service_uuid"));
  if (!serviceUuid) return c.json({ error: "Missing service_uuid" }, 400);

  const coolify = await getCoolifyClient();
  const res = await coolify.deleteService(serviceUuid, {
    delete_configurations: true,
    delete_volumes: true,
    docker_cleanup: true,
    delete_connected_networks: true,
  });

  return c.json({ ok: true, serviceUuid, ...res });
});

export default {
  port: env.PORT,
  fetch: app.fetch,
};

log.info({ port: env.PORT }, "cf-provisioner listening");
