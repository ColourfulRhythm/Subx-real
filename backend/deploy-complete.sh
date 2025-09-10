#!/bin/bash

# COMPLETE FIREBASE BACKEND DEPLOYMENT SCRIPT
# Deploys the bulletproof system with all components

set -e

echo "🚀 Starting Complete Firebase Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "firebase-backend-complete.js" ]; then
    print_error "firebase-backend-complete.js not found. Please run from backend directory."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
if [ -f "package-complete.json" ]; then
    cp package-complete.json package.json
    print_success "Using complete package.json"
fi

npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_success "Dependencies installed"

# Check environment variables
print_status "Checking environment variables..."
required_vars=("FIREBASE_SERVICE_ACCOUNT_KEY" "PAYSTACK_SECRET_KEY" "EMAIL_USER" "EMAIL_PASS")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_warning "Missing environment variables: ${missing_vars[*]}"
    print_warning "Some features may not work properly"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY=${FIREBASE_SERVICE_ACCOUNT_KEY:-""}

# Paystack Configuration
PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY:-"sk_test_your_key_here"}

# Email Configuration
EMAIL_USER=${EMAIL_USER:-"your-email@gmail.com"}
EMAIL_PASS=${EMAIL_PASS:-"your-app-password"}

# Telegram Configuration (Optional)
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN:-""}
TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID:-""}
TELEGRAM_ADMIN_CHAT_ID=${TELEGRAM_ADMIN_CHAT_ID:-""}

# Admin Configuration
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@subxhq.com"}

# Auto-repair (Optional)
AUTO_REPAIR=${AUTO_REPAIR:-"false"}

# Ports
PORT=${PORT:-30002}
ADMIN_PORT=${ADMIN_PORT:-30003}

# JWT Secret
JWT_SECRET=${JWT_SECRET:-"your-jwt-secret-key"}
EOF
    print_success ".env file created"
fi

# Run migration if requested
if [ "$1" = "--migrate" ]; then
    print_status "Running data migration..."
    node migration-tools.js
    if [ $? -ne 0 ]; then
        print_error "Migration failed"
        exit 1
    fi
    print_success "Migration completed"
fi

# Run tests if requested
if [ "$1" = "--test" ] || [ "$2" = "--test" ]; then
    print_status "Running tests..."
    npm test
    if [ $? -ne 0 ]; then
        print_error "Tests failed"
        exit 1
    fi
    print_success "All tests passed"
fi

# Start the main backend
print_status "Starting main backend server..."
node firebase-backend-complete.js &
MAIN_PID=$!

# Wait a moment for the main server to start
sleep 3

# Check if main server is running
if ! kill -0 $MAIN_PID 2>/dev/null; then
    print_error "Main backend failed to start"
    exit 1
fi

print_success "Main backend started (PID: $MAIN_PID)"

# Start admin tools in background
print_status "Starting admin tools..."
node admin-tools.js &
ADMIN_PID=$!

# Wait a moment for admin tools to start
sleep 2

# Check if admin tools are running
if ! kill -0 $ADMIN_PID 2>/dev/null; then
    print_warning "Admin tools failed to start (optional)"
else
    print_success "Admin tools started (PID: $ADMIN_PID)"
fi

# Start monitoring job in background
print_status "Starting monitoring job..."
node monitoring-job.js &
MONITOR_PID=$!

# Wait a moment for monitoring to start
sleep 2

# Check if monitoring is running
if ! kill -0 $MONITOR_PID 2>/dev/null; then
    print_warning "Monitoring job failed to start (optional)"
else
    print_success "Monitoring job started (PID: $MONITOR_PID)"
fi

# Create startup script
cat > start-complete.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Complete Subx Backend System..."

# Start main backend
node firebase-backend-complete.js &
MAIN_PID=$!

# Start admin tools
node admin-tools.js &
ADMIN_PID=$!

# Start monitoring
node monitoring-job.js &
MONITOR_PID=$!

echo "✅ All services started:"
echo "   Main Backend: PID $MAIN_PID (Port 30002)"
echo "   Admin Tools:  PID $ADMIN_PID (Port 30003)"
echo "   Monitoring:   PID $MONITOR_PID"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $MAIN_PID $ADMIN_PID $MONITOR_PID 2>/dev/null
    exit 0
}

# Trap signals for cleanup
trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait
EOF

chmod +x start-complete.sh
print_success "Startup script created: start-complete.sh"

# Create stop script
cat > stop-complete.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Complete Subx Backend System..."

# Find and kill all Node.js processes running our scripts
pkill -f "firebase-backend-complete.js"
pkill -f "admin-tools.js"
pkill -f "monitoring-job.js"

echo "✅ All services stopped"
EOF

chmod +x stop-complete.sh
print_success "Stop script created: stop-complete.sh"

# Display final status
echo ""
print_success "🎉 Complete Firebase Backend Deployment Successful!"
echo ""
echo "📊 Services Running:"
echo "   Main Backend: http://localhost:30002"
echo "   Admin Tools:  http://localhost:30003"
echo "   Health Check: http://localhost:30002/api/health"
echo ""
echo "🔧 Management Commands:"
echo "   Start:  ./start-complete.sh"
echo "   Stop:   ./stop-complete.sh"
echo "   Migrate: node migration-tools.js"
echo "   Monitor: node monitoring-job.js"
echo ""
echo "📚 API Endpoints:"
echo "   Reserve: POST /api/purchases/reserve"
echo "   Webhook: POST /api/webhook/paystack"
echo "   Portfolio: GET /api/users/:uid/portfolio"
echo "   Plot: GET /api/plots/:plotId"
echo "   Admin: GET /api/admin/dashboard"
echo ""
print_warning "Remember to set up your environment variables in .env"
print_warning "Configure Paystack webhook to: https://your-domain.com/api/webhook/paystack"
