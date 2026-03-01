# Dockerfile for CloudFreedom Billing API (Bun + Hono)

FROM oven/bun:1.1.42-alpine

WORKDIR /app

# Copy package files
COPY package*.json bun.lockb* ./

# Install dependencies
RUN bun install 

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check using Bun's native fetch
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["bun", "run", "index.js"]


