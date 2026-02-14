import asyncio
import logging
import os
from typing import Optional

import httpx
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger("telegram-bot")

ROUTER_BASE = os.getenv("CLOUDFREEDOM_ROUTER_BASE_URL", "https://router.cloudfreedom.de").rstrip("/")
API_KEY = os.getenv("CLOUDFREEDOM_API_KEY")


def _auth_headers() -> dict:
    if not API_KEY:
        return {}
    return {"Authorization": f"Bearer {API_KEY}"}


async def router_chat(prompt: str) -> str:
    """Minimal example: call CloudFreedom Router with an OpenAI-compatible request.

    The Router is expected to provide an OpenAI-like /v1/chat/completions endpoint.
    """
    url = f"{ROUTER_BASE}/v1/chat/completions"

    payload = {
        "model": os.getenv("DEFAULT_MODEL", "gpt-4o-mini"),
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
    }

    timeout = httpx.Timeout(30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(url, json=payload, headers=_auth_headers())
        r.raise_for_status()
        data = r.json()

    try:
        return data["choices"][0]["message"]["content"].strip()
    except Exception:
        logger.exception("Unexpected router response shape: %s", data)
        return "Router response could not be parsed."


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Hi. Send me a message and I will answer using CloudFreedom Router.\n"
        "Commands: /ping, /help"
    )


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "This is a hosted Telegram bot running on CloudFreedom Agent Platform.\n"
        "It forwards your message to CloudFreedom Router (OpenAI-compatible)."
    )


async def ping(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("pong")


async def on_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.message.text:
        return

    text = update.message.text.strip()
    if not text:
        return

    await update.message.chat.send_action("typing")

    try:
        answer = await router_chat(text)
        await update.message.reply_text(answer[:4000])
    except httpx.HTTPError as e:
        logger.exception("Router request failed")
        await update.message.reply_text(f"Router error: {e}")


async def main() -> None:
    token: Optional[str] = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise SystemExit("TELEGRAM_BOT_TOKEN is required")

    app = Application.builder().token(token).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("ping", ping))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_message))

    logger.info("Starting bot. Router base: %s", ROUTER_BASE)
    await app.initialize()
    await app.start()
    await app.updater.start_polling(drop_pending_updates=True)

    # Keep running
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
