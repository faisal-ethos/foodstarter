---
inclusion: always
---

# TanStack Start + Docker Best Practices

## Documentation Resources

Always use Context7 to check documentation for Drizzle, TanStack Start, and Docker when needed. Reference the comprehensive best practice files:

- #[[file:DOCKER-POSTGRESS-BEST-PRACTICES.MD]]
- #[[file:TANSTACK-START-BEST-PRACTICES.md]]

## Server Functions

- **HTTP Methods**: Always use `POST` for mutations (create, update, delete). Use `GET` only for data fetching
- **Validation**: Use Zod schemas with `createServerFn().validator()` for type-safe input validation
- **Error Handling**: Wrap server function logic in try-catch blocks and throw meaningful errors

## Database Integration

- **Simplified Structure**: Keep database files in `data/` directory with schema in `data/schema/`
- **schema**: Use JSON file based database system. Read data from file and write data to file

## Environment Variables

- **Server-only**: No prefix (e.g., `DATABASE_URL`, `JWT_SECRET`)
- **Client-safe**: `VITE_` prefix (e.g., `VITE_APP_NAME`, `VITE_API_URL`)
- **Validation**: Always validate environment variables with Zod schemas

## Routing Conventions

- **File-based**: Use TanStack Router's file-based routing in `src/routes/`
- **Layouts**: Use `__root.tsx` for root layout with error boundaries
- **Nested Routes**: Use parent routes with `<Outlet />` for shared layouts
- **Loaders**: Use route loaders for server-side data fetching

## Docker

- **Simple Setup**: Use Docker Compose 
- **Health Checks**: Include health checks in Docker services
- **Development**: Use `docker-compose up` for local development

## Code Quality

- **TypeScript**: Use strict type checking throughout
- **Zod Integration**: Generate Zod schemas from Drizzle schemas with `createInsertSchema`
- **Error Boundaries**: Implement at route and component levels
- **Performance**: Use proper database indexing and query optimization