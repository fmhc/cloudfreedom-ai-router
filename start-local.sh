#!/bin/bash

# CloudFreedom AI Router - Local Development Startup
# Safe startup with port conflict checking

set -e

echo "🚀 CloudFreedom AI Router - Local Development"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for port conflicts
echo "🔍 Checking for port conflicts..."
REQUIRED_PORTS="9200 9201 9202"
CONFLICT=false

for port in $REQUIRED_PORTS; do
    if sudo lsof -i :$port >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is occupied!${NC}"
        sudo lsof -i :$port | head -5
        CONFLICT=true
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
    fi
done

if [ "$CONFLICT" = true ]; then
    echo ""
    echo -e "${RED}ERROR: Required ports are occupied. Please stop the conflicting services first.${NC}"
    exit 1
fi

echo ""
echo "✅ All required ports are available"
echo ""

# Start Docker services
echo "🐳 Starting Docker services..."
cd /mnt/private1/ai-projects/cloudfreedom-ai-router
docker compose -f docker-compose.local.yml up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check PocketBase health
if curl -s http://localhost:9200/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PocketBase is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  PocketBase is starting...${NC}"
fi

# Check Billing API health
if curl -s http://localhost:9201/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Billing API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Billing API is starting...${NC}"
fi

# Start Admin Portal dev server
echo ""
echo "📊 Starting Admin Portal dev server..."
cd /mnt/private1/ai-projects/cloudfreedom-ai-router/admin-portal

# Update .env for local development
cat > .env << 'EOF'
# Admin Portal Frontend Environment Variables - LOCAL DEVELOPMENT
VITE_POCKETBASE_URL=http://localhost:9200
VITE_BILLING_API_URL=http://localhost:9201
EOF

# Start dev server in background
nohup npm run dev -- --port 9202 > /tmp/admin-portal-dev.log 2>&1 &
DEV_PID=$!

echo "⏳ Waiting for Admin Portal to start..."
sleep 8

# Check if dev server is running
if curl -s http://localhost:9202 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin Portal is running${NC}"
else
    echo -e "${YELLOW}⚠️  Admin Portal is starting (may take a few more seconds)${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo "=============================================="
echo ""
echo "📍 Service URLs:"
echo "  🔗 PocketBase:     http://localhost:9200"
echo "  🔗 PocketBase UI:  http://localhost:9200/_/"
echo "  🔗 Billing API:    http://localhost:9201"
echo "  🔗 Admin Portal:   http://localhost:9202"
echo ""
echo "📊 Service Status:"
docker compose -f /mnt/private1/ai-projects/cloudfreedom-ai-router/docker-compose.local.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📝 Next Steps:"
echo "  1. Open http://localhost:9202 in your browser"
echo "  2. Create admin user in PocketBase: http://localhost:9200/_/"
echo "  3. Login to Admin Portal with PocketBase credentials"
echo ""
echo "📊 View Logs:"
echo "  Admin Portal: tail -f /tmp/admin-portal-dev.log"
echo "  PocketBase:   docker logs -f pocketbase-core-local"
echo "  Billing API:  docker logs -f billing-api-local"
echo ""
echo "🛑 To stop all services:"
echo "  ./stop-local.sh"
echo ""
