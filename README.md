# Notify Monorepo

A Turborepo monorepo containing the Notify application's backend and mobile apps.

## Structure

```
notify-monorepo/
├── apps/
│   ├── backend/          # Express.js API with Prisma
│   └── mobile/           # Expo React Native app
├── packages/             # Shared packages (empty for now)
└── turbo.json           # Turborepo configuration
```

## Getting Started

### Prerequisites
- Node.js 18.18.0 or higher (mobile app requires this for os.availableParallelism support)
- If using nvm: `nvm install 18.20.0 && nvm use 18.20.0`

```bash
# Install dependencies
npm install

# Build all apps
npm run build

# Run all apps in development mode (backend only with current Node.js version)
npm run dev

# Run backend only
npm run dev --workspace=apps/backend

# Run mobile (requires Node.js 18.18+)
npm run dev --workspace=apps/mobile

# Run linting
npm run lint

# Format code
npm run format
```

## App-specific Commands

### Backend (`apps/backend`)
```bash
cd apps/backend
npm run dev              # Start development server
npm run build            # Build TypeScript
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
```

### Mobile (`apps/mobile`)
```bash
cd apps/mobile
npm run dev              # Start Expo development server
npm run android          # Run on Android
npm run ios              # Run on iOS
npm run web              # Run on web
```

## Benefits of This Monorepo Setup

- **Unified dependency management**: All projects share the same Node.js version and many dependencies
- **Cross-project code sharing**: Easy to create shared packages in `packages/`
- **Coordinated builds**: Turborepo efficiently builds and caches all projects
- **Simplified development**: Single `npm run dev` command starts all services
- **Better CI/CD**: Deploy multiple apps from a single repository