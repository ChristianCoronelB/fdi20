#!/bin/bash
# Fábrica de Ideas - Server Startup Script
# This script ensures the server is always running

cd /home/z/my-project

# Kill any existing processes
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
pkill -f "supervisor" 2>/dev/null
sleep 2

# Start the supervisor
echo "Starting supervisor..."
nohup node supervisor/supervisor.js > dev.log 2>&1 &
SUPERVISOR_PID=$!
echo $SUPERVISOR_PID > supervisor.pid
disown $SUPERVISOR_PID

echo "Supervisor started with PID: $SUPERVISOR_PID"
echo "Server will be monitored and restarted automatically if it crashes."
