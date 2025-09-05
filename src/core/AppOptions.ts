import { NotAllowedError } from 'src/errors/NotAllowedError'
import { ValidationError } from 'src/errors/ValidationError'
import type { AppOptionsType, AuthType } from 'src/types/common'

class AppOptions {
  private readonly apiUrl: AppOptionsType['apiUrl']
  private readonly apiToken: AppOptionsType['apiToken']
  private readonly appId: AppOptionsType['appId']
  private readonly authSchema: AppOptionsType['authSchema']
  private readonly headerApiTokenKey: AppOptionsType['headerApiTokenKey']
  private readonly environment: AppOptionsType['environment']
  private authToken?: string

  constructor({
    apiUrl = 'https://api.emd.one',
    appId,
    authSchema = 'token',
    headerApiTokenKey = 'apitoken',
    apiToken = '',
    environment,
  }: AppOptionsType) {
    this.apiUrl = apiUrl
    this.appId = appId
    this.apiToken = apiToken
    this.authSchema = authSchema
    this.headerApiTokenKey = headerApiTokenKey
    this.environment = environment
  }

  getOptions() {
    return { apiUrl: this.apiUrl, app: this.appId }
  }

  getEnvironment() {
    return this.environment
  }

  getAuthorizationHeader(
    authType: AuthType = 'auth-token' as AuthType,
  ): Record<string, string> {
    if (authType === 'auth-token') {
      if (!this.authToken) throw new ValidationError('Unable auth token')

      return { Authorization: `${this.authSchema} ${this.authToken}` }
    }

    if (authType === 'api-token') {
      if (this.environment === 'client') {
        throw new NotAllowedError(
          `Obtaining an apiToken is prohibited on the client side`,
        )
      }

      return { [String(this.headerApiTokenKey)]: String(this.apiToken) }
    }

    throw new ValidationError(`Not support current authType (${authType})`)
  }

  setAuthToken(token: string) {
    this.authToken = token
  }
}

export default AppOptions
