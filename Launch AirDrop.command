#!/bin/bash
cd "$(dirname "$0")"

# Check if server is already running on port 3030
if ! curl -s --connect-timeout 1 http://localhost:3030/api/info > /dev/null 2>&1; then
    echo "Starting AirDrop Local server..."
    npm start -- 3030 &
    sleep 2
fi

# Open web app in default browser
open "http://localhost:3030"
