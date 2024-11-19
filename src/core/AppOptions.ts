import { NotAllowedError } from 'src/errors/NotAllowedError'
import { ValidationError } from 'src/errors/ValidationError'
import { AppEnvironment, AppOptionsType, AuthType } from 'src/types/common'

class AppOptions {
  private apiUrl: AppOptionsType['apiUrl']
  private apiToken: AppOptionsType['apiToken']
  private appId: AppOptionsType['appId']
  private authSchema: AppOptionsType['authSchema']
  private headerApiTokenKey: AppOptionsType['headerApiTokenKey']
  private environment: AppOptionsType['environment']
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

  getAuthorizationHeader(
    authType: AuthType = AuthType.AuthToken,
  ): Record<string, string> {
    if (authType === AuthType.AuthToken) {
      if (!this.authToken) throw new ValidationError('Unable auth token')

      return { Authorization: `${this.authSchema} ${this.authToken}` }
    }

    if (authType === AuthType.ApiToken) {
      if (this.environment === AppEnvironment.Client) {
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
