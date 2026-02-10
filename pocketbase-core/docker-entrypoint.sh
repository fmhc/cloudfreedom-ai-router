#!/bin/sh
set -e

# Start PocketBase in background
/usr/local/bin/entrypoint.sh &
POCKETBASE_PID=$!

# Wait a bit for PocketBase to start
sleep 10

# Run initialization script if it exists and collections haven't been initialized
if [ -f /init-collections.sh ] && [ ! -f /pb_data/.collections_initialized ]; then
  echo "Running collection initialization..."
  sh /init-collections.sh
  
  # Mark as initialized
  touch /pb_data/.collections_initialized
fi

# Wait for PocketBase process
wait $POCKETBASE_PID

