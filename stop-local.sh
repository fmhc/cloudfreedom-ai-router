#!/bin/bash

# CloudFreedom AI Router - Stop Local Services

echo "🛑 Stopping CloudFreedom AI Router services..."
echo ""

# Stop admin portal dev server (if running)
echo "📊 Stopping Admin Portal dev server..."
pkill -f "vite.*admin-portal" 2>/dev/null && echo "✅ Admin Portal stopped" || echo "ℹ️  Admin Portal not running"

# Stop Docker services
echo "🐳 Stopping Docker services..."
cd /mnt/private1/ai-projects/cloudfreedom-ai-router
docker compose -f docker-compose.local.yml down

echo ""
echo "✅ All services stopped!"
echo ""

