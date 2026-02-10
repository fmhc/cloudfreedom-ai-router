#!/bin/bash
# CloudFreedom Secret Generation Script
# Usage: ./generate-secrets.sh [tenant_name]

set -e

TENANT_NAME=${1:-"default"}
OUTPUT_FILE="secrets-${TENANT_NAME}-$(date +%Y%m%d-%H%M%S).txt"

echo "🔐 CloudFreedom Secret Generator"
echo "================================="
echo ""
echo "Generating secrets for tenant: ${TENANT_NAME}"
echo ""

# Generate secrets
LITELLM_MASTER_KEY="sk-$(openssl rand -hex 32)"
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)
BILLING_API_KEY=$(openssl rand -hex 32)
USER_API_KEY="sk-$(openssl rand -hex 32)"
POCKETBASE_ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)

# Display secrets
echo "Generated Secrets:"
echo "===================="
echo ""
echo "LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}"
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
echo "REDIS_PASSWORD=${REDIS_PASSWORD}"
echo "BILLING_API_KEY=${BILLING_API_KEY}"
echo "USER_API_KEY=${USER_API_KEY}"
echo "POCKETBASE_ADMIN_PASSWORD=${POCKETBASE_ADMIN_PASSWORD}"
echo ""

# Save to file
cat > "${OUTPUT_FILE}" << EOF
# CloudFreedom Secrets - ${TENANT_NAME}
# Generated: $(date)
# ⚠️  KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT ⚠️

LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
BILLING_API_KEY=${BILLING_API_KEY}
USER_API_KEY=${USER_API_KEY}
POCKETBASE_ADMIN_PASSWORD=${POCKETBASE_ADMIN_PASSWORD}

# Rotation Schedule:
# - Rotate on: $(date -d '+90 days' 2>/dev/null || date -v +90d 2>/dev/null)
# - Next rotation: $(date -d '+180 days' 2>/dev/null || date -v +180d 2>/dev/null)
EOF

echo "✅ Secrets saved to: ${OUTPUT_FILE}"
echo ""
echo "Next steps:"
echo "1. Copy these secrets to your .env file"
echo "2. Update Coolify environment variables"
echo "3. Restart affected services"
echo "4. Store ${OUTPUT_FILE} in a secure location (password manager)"
echo "5. Delete ${OUTPUT_FILE} after copying"
echo ""
echo "🔒 Remember: These secrets will NEVER be shown again!"


