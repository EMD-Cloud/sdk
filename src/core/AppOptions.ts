import { NotAllowedError } from 'src/errors/NotAllowedError'
import { ValidationError } from 'src/errors/ValidationError'
import { AppEnvironment, AppOptionsType, AuthType } from 'src/types/common'

class AppOptions {
  private readonly apiUrl: AppOptionsType['apiUrl']
  private readonly apiToken: AppOptionsType['apiToken']
  private readonly appId: AppOptionsType['appId']
  private readonly authSchema: AppOptionsType['authSchema']
  private readonly headerApiTokenKey: AppOptionsType['headerApiTokenKey']
  private readonly environment: AppOptionsType['environment']
  private readonly defaultAuthType: AppOptionsType['defaultAuthType']
  private authToken?: string

  constructor({
    apiUrl = 'https://api.emd.one',
    appId,
    authSchema = 'token',
    headerApiTokenKey = 'apitoken',
    apiToken = '',
    environment,
    defaultAuthType,
  }: AppOptionsType) {
    this.apiUrl = apiUrl
    this.appId = appId
    this.apiToken = apiToken
    this.authSchema = authSchema
    this.headerApiTokenKey = headerApiTokenKey
    this.environment = environment
    this.defaultAuthType = defaultAuthType || this.determineDefaultAuthType()
  }

  getOptions() {
    return { apiUrl: this.apiUrl, app: this.appId }
  }

  getEnvironment() {
    return this.environment
  }

  private determineDefaultAuthType(): AuthType {
    if (this.environment === AppEnvironment.Client) {
      return AuthType.AuthToken
    }
    // Server: use ApiToken if available, otherwise AuthToken
    return this.apiToken ? AuthType.ApiToken : AuthType.AuthToken
  }

  getAuthorizationHeader(authType?: AuthType): Record<string, string> {
    const effectiveAuthType = authType || this.defaultAuthType
    if (effectiveAuthType === AuthType.AuthToken) {
      if (!this.authToken) throw new ValidationError('Unable auth token')

      return { Authorization: `${this.authSchema} ${this.authToken}` }
    }

    if (effectiveAuthType === AuthType.ApiToken) {
      if (this.environment === AppEnvironment.Client) {
        throw new NotAllowedError(
          `Obtaining an apiToken is prohibited on the client side`,
        )
      }

      return { [String(this.headerApiTokenKey)]: String(this.apiToken) }
    }

    throw new ValidationError(
      `Not support current authType (${effectiveAuthType})`,
    )
  }

  setAuthToken(token: string) {
    this.authToken = token
  }
}

export default AppOptions
