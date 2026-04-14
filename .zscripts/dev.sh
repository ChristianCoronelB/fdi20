#!/bin/bash
set -e

cd /home/z/my-project

echo "=== Fábrica de Ideas Development Server ==="
echo "Starting Next.js on port 3000..."

# Start the Next.js development server
exec bun run dev
