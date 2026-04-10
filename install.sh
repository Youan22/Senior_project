#!/bin/bash

# ServiceMatch Installation Script
echo "🚀 Setting up ServiceMatch..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Create environment file
echo "⚙️  Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
else
    echo "⚠️  .env file already exists. Skipping creation."
fi

# Create database
echo "🗄️  Setting up database..."
echo "Please enter your PostgreSQL credentials:"
read -p "Database name (default: servicematch_dev): " DB_NAME
DB_NAME=${DB_NAME:-servicematch_dev}

read -p "Database user (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Database password: " -s DB_PASSWORD
echo

read -p "Database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Create database
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database may already exist"

# Run migrations
echo "🔄 Running database migrations..."
cd server && npx knex migrate:latest && cd ..

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "Happy coding! 🎉"
