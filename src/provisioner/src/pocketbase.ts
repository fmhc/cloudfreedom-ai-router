import PocketBase from "pocketbase";
import type { Env } from "./env";

export type BotInstanceStatus =
  | "pending"
  | "deploying"
  | "running"
  | "stopped"
  | "error";

export type BotInstanceRecord = {
  id: string;
  tenant_id: string;
  template_id: string;
  status: BotInstanceStatus;
  coolify_app_id?: string;
  subdomain: string;
  config?: unknown;
  created: string;
  updated: string;
};

export type BotTemplateRecord = {
  id: string;
  name: string;
  description?: string;
  compose_template: string;
  required_secrets: string[];
  default_config?: unknown;
  created: string;
  updated: string;
};

export function createPb(env: Env) {
  if (!env.POCKETBASE_URL) return null;
  return new PocketBase(env.POCKETBASE_URL);
}

export async function pbAdminAuth(pb: PocketBase, env: Env) {
  if (env.POCKETBASE_ADMIN_TOKEN) {
    pb.authStore.save(env.POCKETBASE_ADMIN_TOKEN, null);
    return;
  }
  if (!env.POCKETBASE_ADMIN_EMAIL || !env.POCKETBASE_ADMIN_PASSWORD) {
    throw new Error(
      "PocketBase is configured but no admin auth provided (set POCKETBASE_ADMIN_TOKEN or POCKETBASE_ADMIN_EMAIL/POCKETBASE_ADMIN_PASSWORD).",
    );
  }
  await pb
    .collection("_superusers")
    .authWithPassword(env.POCKETBASE_ADMIN_EMAIL, env.POCKETBASE_ADMIN_PASSWORD);
}

export async function pbGetCoolifyToken(
  pb: PocketBase,
  tokenName: string,
): Promise<string> {
  // Requires a collection personal_access_tokens { name, token }.
  // If token field is not exposed, store it in a separate secrets collection.
  const rec = await pb
    .collection("personal_access_tokens")
    .getFirstListItem<{ token: string; name: string }>(`name="${tokenName}"`);
  if (!rec.token) throw new Error(`Coolify token record '${tokenName}' has no token field.`);
  return rec.token;
}

export async function pbGetOrCreateBotTemplate(
  pb: PocketBase,
  input: {
    name: string;
    compose_template: string;
    description?: string;
    required_secrets: string[];
    default_config?: unknown;
  },
): Promise<BotTemplateRecord> {
  try {
    return await pb
      .collection("bot_templates")
      .getFirstListItem<BotTemplateRecord>(`name="${input.name}"`);
  } catch {
    return await pb.collection("bot_templates").create<BotTemplateRecord>({
      name: input.name,
      description: input.description ?? "",
      compose_template: input.compose_template,
      required_secrets: input.required_secrets,
      default_config: input.default_config ?? {},
    });
  }
}

export async function pbUpsertBotInstance(
  pb: PocketBase,
  input: {
    tenant_id: string;
    template_id: string;
    subdomain: string;
    status: BotInstanceStatus;
    coolify_app_id?: string;
    config?: unknown;
  },
): Promise<BotInstanceRecord> {
  const filter = `tenant_id="${input.tenant_id}" && template_id="${input.template_id}"`;
  try {
    const existing = await pb
      .collection("bot_instances")
      .getFirstListItem<BotInstanceRecord>(filter);

    return await pb.collection("bot_instances").update<BotInstanceRecord>(existing.id, {
      ...input,
    });
  } catch {
    return await pb.collection("bot_instances").create<BotInstanceRecord>({
      ...input,
    });
  }
}

export async function pbLog(
  pb: PocketBase,
  input: {
    instance_id: string;
    action: "deploy" | "stop" | "restart" | "destroy";
    status: "success" | "error";
    message: string;
  },
) {
  await pb.collection("deploy_logs").create({
    instance_id: input.instance_id,
    action: input.action,
    status: input.status,
    message: input.message,
  });
}
