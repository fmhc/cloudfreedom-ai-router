/**
 * Docker Compose templates for agent stacks
 */

export interface TemplateConfig {
  stackName: string
  domain?: string
  envVars?: Record<string, string>
}

export function getOpenClawAgentCompose(config: TemplateConfig): string {
  const domain = config.domain || `${config.stackName}.cloudfreedom.de`
  return `
services:
  agent:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: ${config.stackName}
    restart: unless-stopped
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-}
      - TELEGRAM_BOT_TOKEN=\${TELEGRAM_BOT_TOKEN:-}
      - AGENT_NAME=\${AGENT_NAME:-${config.stackName}}
    volumes:
      - agent-data:/data
    labels:
      - "caddy=${domain}"
      - "caddy.reverse_proxy=agent:3000"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  agent-data:
`.trim()
}

export function getTelegramBotCompose(config: TemplateConfig): string {
  return `
services:
  bot:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: ${config.stackName}
    restart: unless-stopped
    environment:
      - TELEGRAM_BOT_TOKEN=\${TELEGRAM_BOT_TOKEN}
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-}
      - AGENT_NAME=\${AGENT_NAME:-${config.stackName}}
    volumes:
      - bot-data:/data

volumes:
  bot-data:
`.trim()
}

export function getBaseLLMCompose(config: TemplateConfig): string {
  const domain = config.domain || `${config.stackName}.cloudfreedom.de`
  return `
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    container_name: ${config.stackName}-litellm
    restart: unless-stopped
    environment:
      - LITELLM_MASTER_KEY=\${LITELLM_MASTER_KEY:-sk-cloudfreedom}
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-}
      - GOOGLE_API_KEY=\${GOOGLE_API_KEY:-}
    ports:
      - "4000"
    volumes:
      - litellm-data:/app/data
    labels:
      - "caddy=${domain}"
      - "caddy.reverse_proxy=litellm:4000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  litellm-data:
`.trim()
}

export function getDockerCompose(template: string, config: TemplateConfig): string {
  switch (template) {
    case 'openclaw-agent':
      return getOpenClawAgentCompose(config)
    case 'telegram-bot':
      return getTelegramBotCompose(config)
    case 'base-llm':
      return getBaseLLMCompose(config)
    default:
      throw new Error(`Unknown template: ${template}`)
  }
}
