import pino from "pino";
import type { Env } from "./env";

export function createLogger(env: Env) {
  return pino({
    level: env.LOG_LEVEL,
    base: undefined,
    redact: {
      paths: [
        "req.headers.authorization",
        "*.authorization",
        "*.token",
        "*.password",
        "*.OPENAI_API_KEY",
        "*.ANTHROPIC_API_KEY",
        "*.TELEGRAM_BOT_TOKEN",
      ],
      remove: true,
    },
  });
}
