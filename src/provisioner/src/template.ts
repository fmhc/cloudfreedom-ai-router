import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function renderComposeTemplate(opts: {
  repoRoot: string;
  templatePath: string;
  tenantId: string;
  subdomain: string;
  traefikNetwork: string;
}) {
  const abs = resolve(opts.repoRoot, opts.templatePath);
  const raw = await readFile(abs, "utf8");

  return raw
    .replaceAll("{{TENANT_ID}}", opts.tenantId)
    .replaceAll("{{SUBDOMAIN}}", opts.subdomain)
    .replaceAll("{{TRAEFIK_NETWORK}}", opts.traefikNetwork);
}

export function base64Compose(composeYaml: string) {
  // Coolify expects docker_compose_raw as base64.
  return Buffer.from(composeYaml, "utf8").toString("base64");
}
