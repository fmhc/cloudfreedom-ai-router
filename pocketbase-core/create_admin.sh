#!/bin/bash
# Create PocketBase Admin User

ADMIN_EMAIL="admin@localhost"
ADMIN_PASSWORD="CloudFreedom2025!"

echo "Creating admin user in PocketBase..."
echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"

# First, check if PocketBase is running
if ! curl -s http://localhost:9200/api/health > /dev/null; then
    echo "ERROR: PocketBase is not running on port 9200"
    exit 1
fi

# Create admin via the initial setup endpoint
curl -X POST http://localhost:9200/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d "{
    \"identity\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }" 2>&1 | head -10

echo ""
echo "If you see 'invalid credentials', the admin might not exist yet."
echo "Please visit http://localhost:9200/_/ to create the first admin."
