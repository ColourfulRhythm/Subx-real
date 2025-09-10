#!/bin/bash

echo "🚀 DEPLOYING AUTOMATED PLOT SYSTEM..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Initialize all plots
echo "🏠 Initializing all plots..."
node automated-plot-system.js init

# 3. Test all plots
echo "🧪 Testing all plots..."
node test-all-plots-automated.js

# 4. Start the server
echo "🚀 Starting automated server..."
npm start

echo "✅ AUTOMATED SYSTEM DEPLOYED!"
echo "🏠 All plots (77, 78, 79, 4, 5) are now automated!"
echo "💳 Payment system works for all plots!"
echo "📊 Dashboard displays all plots automatically!"
