# CloudFreedom Provisioner (MVP)

A small CLI that provisions tenant stacks on **Coolify** using Docker Compose templates from `../../templates`.

## Install

```bash
cd src/provisioner
npm install
```

## Configure

Create `.env` from `.env.example`.

Required:

- `COOLIFY_URL` (e.g. `https://152.53.179.226`)
- `COOLIFY_TOKEN` (Coolify API token)
- `COOLIFY_SERVER_UUID`
- `COOLIFY_DESTINATION_UUID`

## Usage

```bash
node index.js --help

node index.js \
  --tenant tenant_abc \
  --project-name "Tenant ABC" \
  --template telegram-bot \
  --stack-name abc-telegram \
  --env TELEGRAM_BOT_TOKEN=... \
  --env CLOUDFREEDOM_ROUTER_BASE_URL=https://router.cloudfreedom.de \
  --env CLOUDFREEDOM_API_KEY=...
```

Domains are optional; for web-exposed stacks you can pass:

```bash
node index.js \
  --tenant tenant_abc \
  --project-name "Tenant ABC" \
  --template base-llm \
  --stack-name abc-llm \
  --domain "webui=ui.abc.cloudfreedom.de" \
  --domain "litellm=llm.abc.cloudfreedom.de" \
  --env WEBUI_DOMAIN=ui.abc.cloudfreedom.de \
  --env LITELLM_DOMAIN=llm.abc.cloudfreedom.de
```

## Notes

- The compose templates are sent via Coolify `POST /api/v1/services` as `docker_compose_raw`.
- Variable resolution is done in the provisioner (simple `${VAR}` / `${VAR:-default}` rendering), and any remaining variables can be configured in Coolify.
