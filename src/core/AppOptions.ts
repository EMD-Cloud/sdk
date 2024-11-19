export enum AppEnvironment {
  Client = 'client',
  Server = 'server'
}

export interface AppOptionsType {
  environment: AppEnvironment
  apiUrl?: string
  appId: string
  authSchema?: string
  token?: string
}

class AppOptions {
  private apiUrl: string
  private appId: string
  private authSchema: string
  private token?: string

  constructor({
    apiUrl = 'https://api.emd.one',
    appId,
    authSchema = 'token'
  }: AppOptionsType) {
    this.apiUrl = apiUrl
    this.appId = appId
    this.authSchema = authSchema
  }

  getOptions() {
    return { apiUrl: this.apiUrl, app: this.appId }
  }

  getAuthToken() {
    return this.token
  }

  setAuthToken(token: string) {
    this.token = `${this.authSchema} ${token}`
  }
}

export default AppOptions
