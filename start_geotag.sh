#!/bin/bash
# GeoTag Pro Startup Script

echo "🚀 Starting GeoTag Pro..."
echo ""
echo "✅ Features ready:"
echo "   - 23+ Advanced features"
echo "   - AI powered by Google Gemini"
echo "   - GPX track import"
echo "   - Bengali/English support"
echo "   - Dark mode"
echo ""

# Stop any Node.js processes
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true

# Wait a moment
sleep 1

# Start Flask app
echo "🐍 Starting Python Flask server..."
python app.py
