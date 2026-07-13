#!/bin/bash
# macOS / Linux launcher. First run: chmod +x start.command  (then double-click).
cd "$(dirname "$0")"
if [ ! -d node_modules/electron ]; then
  echo "Installing dependencies, this only happens once..."
  npm install || { echo; echo "npm install failed. Make sure Node.js is installed."; read -n1 -s; exit 1; }
fi
npm start
