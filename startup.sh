#!/bin/bash
# Start a simple HTTP server to serve the frontend files
# This assumes your index.html is in the root directory or a public/build directory
# If your main HTML file is in a subdirectory like 'public' or 'dist', 
# you might need to cd into that directory first, e.g., cd public

echo "Starting HTTP server on port 9000..."
python3 -m http.server 9000