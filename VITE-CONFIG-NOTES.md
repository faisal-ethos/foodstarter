# Vite Configuration - Node.js Compatibility

## Problem

The Matrix Food Tracker was failing because `fs.writeFile` from Node.js is not available in the Cloudflare Workers runtime. The app uses a JSON file-based database system that requires Node.js `fs` module for file operations.

## Solution

Modified `vite.config.ts` to conditionally disable the Cloudflare plugin in development mode:

```typescript
const config = defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  
  return {
    plugins: [
      // Only use Cloudflare plugin in production
      !isDev && cloudflare({ viteEnvironment: { name: 'ssr' } }),
      // ... other plugins
    ].filter(Boolean),
    ssr: {
      noExternal: isDev ? [] : undefined,
    },
  }
})
```

## How It Works

- **Development Mode**: Cloudflare plugin is disabled, allowing full Node.js runtime with `fs` module support
- **Production Mode**: Cloudflare plugin is enabled for deployment compatibility
- The `.filter(Boolean)` removes falsy values (the disabled Cloudflare plugin) from the plugins array

## Benefits

1. JSON file-based database works seamlessly in development
2. Maintains Cloudflare compatibility for production builds
3. No code changes needed in the service layer
4. Clean separation of development and production environments

## Note for Production

If deploying to Cloudflare Workers, you'll need to migrate from the JSON file-based database to a Cloudflare-compatible solution like:
- Cloudflare D1 (SQLite)
- Cloudflare KV
- Cloudflare Durable Objects
- External database with HTTP API

The current JSON file system will only work in Node.js environments (development, Node.js hosting platforms).
