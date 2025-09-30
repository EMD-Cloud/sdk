# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build & Development
- `npm run build` - Clean build with TypeScript compilation and Rollup bundling (outputs to dist/)
- `npm run prettier:formatting` - Format all source code with Prettier
- **Note**: No test command implemented - test script returns error code 1

### Linting & Type Checking
- Run ESLint directly: `npx eslint src/`
- Type check: `npx tsc --noEmit`

## Architecture

The EMD Cloud SDK is a TypeScript library for interacting with the EMD Cloud API, supporting both client-side and server-side environments.

### Core Structure
- **EmdCloud class** (`src/core/EmdCloud.ts`): Main SDK entry point with `auth`, `user`, `webhook`, `uploader`, and `database` modules
- **AppOptions** (`src/core/AppOptions.ts`): Manages SDK configuration, API URLs, and auth headers
- **Auth module** (`src/user/Auth.ts`): Handles user authentication, registration, password reset, and social OAuth login (VK/Yandex)
- **UserInteraction module** (`src/user/UserInteraction.ts`): Manages user interactions, social account connections (Steam/VK/Twitch), activity tracking (ping), and user management operations (list/details)
- **Uploader module** (`src/uploader/Uploader.ts`): Handles file uploads using TUS protocol with progress tracking, resumable uploads, and permission-based access control
- **Webhook module** (`src/webhook/Webhook.ts`): Execute webhooks with flexible auth options
- **Database module** (`src/database/Database.ts`): CRUD operations for database collections with MongoDB-style querying

### Key Design Patterns
- **Environment-aware**: SDK differentiates between client/server environments - API tokens only work server-side
- **Configuration-based authentication**: Set `defaultAuthType` during SDK initialization (smart defaults based on environment and available tokens)
- **Auth types**: Supports both AuthToken (user sessions) and ApiToken (server-side) authentication via AuthType enum
- **Optional auth overrides**: Methods accept optional authType parameter to override the configured default when needed
- **Module separation**:
  - **Auth module** (`auth`) handles authentication flows: login, registration, OAuth (VK/Yandex), password reset
  - **UserInteraction module** (`user`) handles user management: social account connections (Steam/VK/Twitch), activity tracking (ping), user listing/details
  - **Uploader module** (`uploader`) handles file uploads: TUS protocol-based resumable uploads with progress tracking, permission controls, and automatic retries
- **OAuth flow**: Social login via VK/Yandex - initiate with `auth.socialLogin()`, handle callback, exchange secret with `auth.exchangeOAuthToken()`
- **Social account attachment**: Connect existing users to social platforms (Steam/VK/Twitch) via `user.attachSocialAccount()` and `user.detachSocialAccount()`
- **User presence tracking**: Track user activity and online status with `user.ping()` method
- **File uploads with TUS protocol**: Uploader module uses TUS (resumable upload protocol) for chunked file uploads with:
  - **Resumable uploads**: Uploads can be paused and resumed, surviving connection interruptions
  - **Progress tracking**: Real-time progress callbacks with bytes uploaded/total and percentage
  - **Permission-based access**: Control file access with ReadPermission enum (Public, OnlyAuthUser, OnlyAppStaff, OnlyPermittedUsers)
  - **Automatic authentication**: Auth headers injected automatically from SDK configuration
  - **Retry mechanism**: Configurable retry delays for failed chunk uploads
  - **Abort capability**: Cancel in-progress uploads programmatically
- **Database collections**: Each Database instance is scoped to a specific collection within the app's space - create multiple instances for different collections
- **MongoDB-style queries**: Database module supports complex filtering with `$and`, `$or`, and comparison operators
- **Response handling**: All API responses follow `ResponseData<T>` format with data/error structure
- **Error classes**: Custom error types in `src/errors/` for validation, server, and permission errors

### Type System
All types are in `src/types/` with strict TypeScript mode enabled. Key interfaces:
- `AppOptionsType`: SDK configuration interface (includes optional `defaultAuthType`)
- `AuthType`: Enum for authentication types ('auth-token' | 'api-token')
- `CallOptions`: Optional authentication override interface with optional `authType`
- `UserData`: Complete user profile structure
- `SocialProvider`: Enum for social providers (VK, Yandex, Steam, Twitch)
- `SocialAttachResponse`: Response from social account attachment request
- `UserListOptions`: Options for user list retrieval (search, pagination, sorting, filtering)
- `UserListResponse`: Response with user list data and total count
- `AccountStatus`: Enum for user account statuses (Pending, Approved, Rejected)
- `PingStatus`: Enum for user online status (Online, Offline)
- `ReadPermission`: Enum for file access levels (Public, OnlyAuthUser, OnlyAppStaff, OnlyPermittedUsers)
- `UploadStatus`: Enum for upload state tracking (Pending, Uploading, Success, Failed)
- `UploadOptions`: Configuration interface for file uploads (integration, chunkSize, retryDelays, readPermission, permittedUsers, presignedUrlTTL, headers)
- `UploadProgress`: Progress tracking interface (bytesUploaded, bytesTotal, percentage)
- `UploadFile`: File state and control interface (id, fileName, status, progress, fileUrl, error, abort)
- `UploadCallbacks`: Event handlers interface (onProgress, onSuccess, onError)
- `StartUploadResponse`: Response from upload initiation (uploadId, file)
- `DatabaseRowData<T>`: Generic database row structure with flexible data typing
- `DatabaseQuery`: MongoDB-style query interface with `$and`, `$or` support
- `DatabaseListOptions`: Comprehensive options for row retrieval (pagination, sorting, filtering)
- `DatabaseSaveMode`: Enum for save operations (SYNC | ASYNC)
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
