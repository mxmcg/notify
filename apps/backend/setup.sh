#!/bin/bash

# Setup script for the backend

echo "🔧 Setting up Notify Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your actual values!"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if DATABASE_URL is set
if grep -q "your-database-url-here" .env 2>/dev/null; then
    echo "⚠️  Please set your DATABASE_URL in .env before running migrations"
    exit 1
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run migrations (optional, requires database)
read -p "🗄️  Do you want to run database migrations? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Running database migrations..."
    npx prisma migrate dev --name init
else
    echo "⏭️  Skipping database migrations"
fi

echo "✅ Backend setup complete!"
echo "🚀 Start development server with: npm run dev"