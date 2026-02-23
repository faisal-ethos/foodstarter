# Technology Stack

## Framework & Runtime

- **TanStack Start** - Full-stack React framework with SSR, streaming, and server functions
- **React 19** - UI library with latest features
- **TypeScript** - Strict type checking enabled
- **Vite** - Build tool and development server

## Database

- **JSON** - JSON file system

## Styling & UI

- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon library

## Code Quality & Formatting

- **Biome** - Fast formatter and linter (replaces ESLint + Prettier)
- **Tab indentation** - Project standard
- **Double quotes** - JavaScript/TypeScript string preference

## Package Management

- **npm** - Fast, disk space efficient package manager

## Common Commands

### Development

```bash
npm dev          # Start development server on port 3000
npm build        # Build for production
npm serve        # Preview production build
```

### Code Quality

```bash
npm format       # Format code with Biome
npm lint         # Lint code with Biome
npm check        # Run both format and lint
```

### Database Operations

```bash
npm db:generate  # Generate migrations from schema changes
npm db:migrate   # Apply migrations to database
npm db:push      # Push schema directly to database (dev)
npm db:pull      # Pull schema from database
npm db:studio    # Open Drizzle Studio (database GUI)
```

### Testing

```bash
npm test         # Run tests with Vitest
```

## Environment Setup

- Requires `.env.local` file with `DATABASE_URL` for PostgreSQL connection
- Uses `dotenv` for environment variable loading