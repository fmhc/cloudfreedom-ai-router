# OpenClaw Agent Template

Deploys a single OpenClaw bot instance with:
- Isolated Docker network
- Persistent workspace volume
- Traefik HTTPS routing (`{tenant}.cloudfreedom.de`)
- Resource limits (default: 1 CPU, 1GB RAM)

## Required Secrets
| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude models) |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `GOOGLE_API_KEY` | Google AI key (optional) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (optional) |

## Deploy
```bash
export TENANT_ID=demo
export ANTHROPIC_API_KEY=sk-ant-...
docker compose up -d
```

## Customization
Set `OPENCLAW_CONFIG` as JSON to fully customize the agent config (model, channels, tools, etc.).
