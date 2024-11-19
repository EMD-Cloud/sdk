export enum AppEnvironment {
  Client = 'client',
  Server = 'server',
}

export interface AppOptionsType {
  environment: AppEnvironment
  apiUrl?: string
  appId: string
  authSchema?: string
  headerApiTokenKey?: string
  apiToken?: string
}

export enum AuthType {
  AuthToken = 'auth-token',
  ApiToken = 'api-token',
}

export type CallOptions = {
  authType: AuthType
  ignoreFormatResponse?: boolean
}
