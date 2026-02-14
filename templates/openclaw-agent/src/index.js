import express from 'express'
import pino from 'pino'

const log = pino({ level: process.env.LOG_LEVEL || 'info' })

const port = Number(process.env.PORT || '3000')
const agentName = process.env.AGENT_NAME || 'openclaw-agent'
const webhookSecret = process.env.WEBHOOK_SECRET || ''

const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, name: agentName })
})

app.get('/', (_req, res) => {
  res.type('text/plain').send(`${agentName} running`)
})

app.post('/webhook', (req, res) => {
  const provided = req.header('x-webhook-secret') || ''
  if (webhookSecret && provided !== webhookSecret) {
    return res.status(401).json({ ok: false, error: 'unauthorized' })
  }

  // In a full OpenClaw deployment, this would forward the event into the agent runtime.
  log.info({ event: 'webhook', body: req.body }, 'received webhook')
  return res.json({ ok: true })
})

app.listen(port, '0.0.0.0', () => {
  log.info({ agentName, port }, 'agent started')
})
