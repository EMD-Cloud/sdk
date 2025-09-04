# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build & Development
- `npm run build` - Clean build with TypeScript compilation and Rollup bundling (outputs to dist/)
- `npm run prettier:formating` - Format all source code with Prettier
- **Note**: No test command implemented - test script returns error code 1

### Linting & Type Checking
- Run ESLint directly: `npx eslint src/`
- Type check: `npx tsc --noEmit`

## Architecture

The EMD Cloud SDK is a TypeScript library for interacting with the EMD Cloud API, supporting both client-side and server-side environments.

### Core Structure
- **EmdCloud class** (`src/core/EmdCloud.ts`): Main SDK entry point with `auth` and `webhook` modules
- **AppOptions** (`src/core/AppOptions.ts`): Manages SDK configuration, API URLs, and auth headers
- **Auth module** (`src/user/Auth.ts`): Handles user authentication, registration, password reset, and social OAuth login (VK/Yandex)
- **Webhook module** (`src/webhook/Webhook.ts`): Execute webhooks with flexible auth options

### Key Design Patterns
- **Environment-aware**: SDK differentiates between client/server environments - API tokens only work server-side
- **Auth types**: Supports both AuthToken (user sessions) and ApiToken (server-side) authentication
- **OAuth flow**: Social login via VK/Yandex - initiate with `socialLogin()`, handle callback, exchange secret with `exchangeOAuthToken()`
- **Response handling**: All API responses follow `ResponseData<T>` format with data/error structure
- **Error classes**: Custom error types in `src/errors/` for validation, server, and permission errors

### Type System
All types are in `src/types/` with strict TypeScript mode enabled. Key interfaces:
- `AppOptionsType`: SDK configuration interface
- `UserData`: Complete user profile structure
- `ResponseData<T>` / `ResponseError`: Standardized API response types

### Build Configuration
- **Rollup** with esbuild for fast bundling
- Multiple outputs: minified ES modules, source maps, and type declarations
- Entry point: `src/index.ts` → exports to `dist/`
- TypeScript target: ES2018 with ESNext modules

### Development Notes
- Default API URL: `https://api.emd.one`
- HTTP client (`src/utils/fetch.ts`) wraps fetch with automatic JSON parsing and error handling
- Response formatter (`src/utils/formatters.ts`) extracts data from API response structure
- Semantic Release automates NPM publishing on main branch pushes