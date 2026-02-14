import { z } from "zod";

const boolFromString = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
  });

export const EnvSchema = z.object({
  // Service
  PORT: z.coerce.number().int().positive().default(8788),
  LOG_LEVEL: z.string().default("info"),

  // PocketBase (optional but recommended)
  POCKETBASE_URL: z.string().url().optional(),
  POCKETBASE_ADMIN_EMAIL: z.string().email().optional(),
  POCKETBASE_ADMIN_PASSWORD: z.string().min(1).optional(),
  POCKETBASE_ADMIN_TOKEN: z.string().min(1).optional(),

  // Coolify
  COOLIFY_BASE_URL: z.string().url().default("https://coolify.callthe.dev/api/v1"),
  COOLIFY_API_TOKEN: z.string().min(1).optional(),
  COOLIFY_TOKEN_NAME: z.string().default("cloudfreedom-provisioner"),

  // Defaults for where to deploy on Coolify
  COOLIFY_SERVER_UUID: z.string().min(1),
  COOLIFY_DESTINATION_UUID: z.string().min(1),
  COOLIFY_ENVIRONMENT_NAME: z.string().default("production"),

  // Domain routing
  BOT_DOMAIN_BASE: z.string().min(1).default("agents.cloudfreedom.ai"),
  TRAEFIK_NETWORK: z.string().min(1).default("coolify-proxy"),

  // Template
  OPENCLAW_TEMPLATE_PATH: z
    .string()
    .default("templates/openclaw-agent/docker-compose.yml"),

  // Behavior
  AUTO_DEPLOY: boolFromString.default("true"),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Zod error is readable enough.
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  return parsed.data;
}
