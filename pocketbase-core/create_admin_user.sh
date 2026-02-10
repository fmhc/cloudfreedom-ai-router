#!/bin/bash

# Script to create initial admin user for CloudFreedom Admin Portal
# This creates a user in PocketBase with secure generated password

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CloudFreedom Admin User Creation ===${NC}\n"

# Generate secure password
PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
echo -e "${GREEN}Generated secure password:${NC} ${PASSWORD}"
echo -e "${RED}⚠️  SAVE THIS PASSWORD - It will not be shown again!${NC}\n"

# Configuration
POCKETBASE_URL="${POCKETBASE_URL:-https://api.cloudfreedom.de}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@cloudfreedom.de}"

echo "PocketBase URL: ${POCKETBASE_URL}"
echo "Admin Email: ${ADMIN_EMAIL}"
echo ""

# Get default tenant and product IDs
echo "Fetching default tenant and product..."

# Get first tenant
TENANT_ID=$(curl -s "${POCKETBASE_URL}/api/collections/tenants/records?perPage=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TENANT_ID" ]; then
    echo -e "${RED}Error: No tenants found. Please create a tenant first.${NC}"
    exit 1
fi

echo "Using Tenant ID: ${TENANT_ID}"

# Get first product
PRODUCT_ID=$(curl -s "${POCKETBASE_URL}/api/collections/products/records?perPage=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PRODUCT_ID" ]; then
    echo -e "${RED}Error: No products found. Please create a product first.${NC}"
    exit 1
fi

echo "Using Product ID: ${PRODUCT_ID}"

# Get product budget
BUDGET=$(curl -s "${POCKETBASE_URL}/api/collections/products/records/${PRODUCT_ID}" | grep -o '"budget_included":[0-9.]*' | cut -d':' -f2)
BUDGET=${BUDGET:-100}

echo "Budget: €${BUDGET}"
echo ""

# Generate LiteLLM API Key
LITELLM_KEY="sk-$(openssl rand -hex 32)"

# Calculate budget reset date (30 days from now)
RESET_DATE=$(date -d "+30 days" -u +"%Y-%m-%d %H:%M:%S.000Z" 2>/dev/null || date -v+30d -u +"%Y-%m-%d %H:%M:%S.000Z")

# Create user
echo "Creating admin user..."

RESPONSE=$(curl -s -X POST "${POCKETBASE_URL}/api/collections/users/records" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${PASSWORD}\",
    \"passwordConfirm\": \"${PASSWORD}\",
    \"status\": \"active\",
    \"tenant_id\": \"${TENANT_ID}\",
    \"product_id\": \"${PRODUCT_ID}\",
    \"budget_total\": ${BUDGET},
    \"budget_used\": 0,
    \"budget_remaining\": ${BUDGET},
    \"budget_reset_date\": \"${RESET_DATE}\",
    \"litellm_api_key\": \"${LITELLM_KEY}\"
  }")

if echo "$RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Admin user created successfully!${NC}\n"
    
    echo -e "${BLUE}=== Login Credentials ===${NC}"
    echo -e "URL:      ${GREEN}https://admin.cloudfreedom.de${NC}"
    echo -e "Email:    ${GREEN}${ADMIN_EMAIL}${NC}"
    echo -e "Password: ${GREEN}${PASSWORD}${NC}"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Save these credentials in a secure password manager!${NC}"
    echo -e "${RED}⚠️  Change the password after first login!${NC}"
    echo ""
    
    # Save to file (optional)
    cat > admin_credentials.txt <<EOF
CloudFreedom Admin Portal
========================
URL: https://admin.cloudfreedom.de
Email: ${ADMIN_EMAIL}
Password: ${PASSWORD}

LiteLLM API Key: ${LITELLM_KEY}

Created: $(date)
⚠️  DELETE THIS FILE AFTER SAVING CREDENTIALS SECURELY!
EOF
    
    echo -e "${BLUE}Credentials saved to: admin_credentials.txt${NC}"
    echo -e "${RED}⚠️  Delete this file after saving credentials securely!${NC}"
else
    echo -e "${RED}❌ Failed to create user${NC}"
    echo "Response: ${RESPONSE}"
    exit 1
fi

