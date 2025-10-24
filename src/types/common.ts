export enum AppEnvironment {
  Client = 'client',
  Server = 'server',
}

export interface AppOptionsType {
  environment: AppEnvironment
  apiUrl?: string
  websocketUrl?: string
  appId: string
  authSchema?: string
  headerApiTokenKey?: string
  apiToken?: string
  defaultAuthType?: AuthType
}

/**
 * Authentication type for API requests
 */
export enum AuthType {
  /** User session authentication - available in both client and server environments */
  AuthToken = 'auth-token',
  /** API key authentication - only available in server environment */
  ApiToken = 'api-token',
}

export type CallOptions = {
  authType?: AuthType
  ignoreFormatResponse?: boolean
}
