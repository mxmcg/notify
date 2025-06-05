# Notify Backend

Express.js API with PostgreSQL database for the Notify application.

## Quick Start with Docker

### 1. Prerequisites
- Docker and Docker Compose installed
- Node.js 18.18+ and npm

### 2. Setup

```bash
# Clone and navigate to backend
cd apps/backend

# Copy environment variables
cp .env.example .env

# Add your OpenAI API key to .env
# Edit .env and add your OPENAI_API_KEY

# Start PostgreSQL with Docker
docker-compose up -d

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

The API will be available at http://localhost:4000

### 3. Database Management

Access the database UI at http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: notify_user
- Password: notify_pass
- Database: notify

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### API Documentation

See [API.md](../../API.md) for complete endpoint documentation.

### Testing the API

```bash
# Health check
curl http://localhost:4000/health

# Create a task
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"query":"MLB standings","frequency":"Daily at 8am"}'

# Process with OpenAI (requires API key in .env)
curl -X POST http://localhost:4000/api/llm/process \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is 2+2?"}'
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Express app setup
│   ├── prisma.ts         # Prisma client instance
│   ├── routes/
│   │   ├── tasks.ts      # Task CRUD endpoints
│   │   └── llm.ts        # OpenAI integration
│   ├── schemas/
│   │   └── task.ts       # Zod validation schemas
│   └── services/
│       └── openai.ts     # OpenAI service
├── prisma/
│   └── schema.prisma     # Database schema
├── docker-compose.yml    # Docker configuration
└── .env                  # Environment variables
```

## Troubleshooting

### Port already in use
If port 5432 is already in use:
```bash
# Stop local PostgreSQL
brew services stop postgresql

# Or use a different port in docker-compose.yml
ports:
  - "5433:5432"
# Then update DATABASE_URL in .env to use port 5433
```

### Database connection issues
```bash
# Check if containers are running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart containers
docker-compose restart
```

### Prisma issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database and rerun migrations
npx prisma migrate reset
```