import AppOptions from 'src/core/AppOptions'
import { ValidationError } from 'src/errors/ValidationError'
import { ServerError } from 'src/errors/ServerError'
import { UserData, ForgotPassData, ForgotPassCheckCodeData } from 'src/types/user'
import { apiRequest } from 'src/utils/fetch'
import {
  userResponseFormatter,
  forgotPassResponseFormatter,
  forgotPassCheckCodeResponseFormatter
} from 'src/utils/formatters'

class Auth {
  private applicationOptions: AppOptions

  constructor(applicationOptions: AppOptions) {
    this.applicationOptions = applicationOptions
  }

  async authorization(): Promise<UserData | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const token = this.applicationOptions.getAuthToken()

    if (!token) throw new ValidationError('Unable auth token')

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/me`,
      {
        method: 'POST',
        headers: { Authorization: token },
        body: null
      }
    )

    const data = userResponseFormatter(res)

    this.applicationOptions.setAuthToken(data.token)

    return data
  }

  async login({
    login,
    password,
  }: {
    login: string
    password: string
  }): Promise<UserData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      }
    )

    const data = userResponseFormatter(res)

    this.applicationOptions.setAuthToken(data.token)

    return data
  }

  async registration({
    firstName,
    lastName,
    login,
    password,
    customFields,
    captchaToken
  }: {
    firstName?: string
    lastName?: string
    login: string
    password: string
    customFields?: Record<string, any>
    captchaToken?: string
  }): Promise<UserData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/register`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          login,
          password,
          customFields,
          captchaToken
        }),
        method: 'POST'
      }
    )

    const data = userResponseFormatter(res)

    this.applicationOptions.setAuthToken(data.token)

    return data
  }

  async forgotPassword(email: string): Promise<ForgotPassData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/forgot`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        method: 'POST'
      }
    )

    const data = forgotPassResponseFormatter(res)

    return data
  }

  async forgotPasswordCheckCode({
    requestId,
    code
  }: {
    requestId: string
    code: string
  }): Promise<ForgotPassCheckCodeData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/forgot/${requestId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        method: 'POST'
      }
    )

    const data = forgotPassCheckCodeResponseFormatter(res)

    return data
  }

  async forgotPasswordChange({
    requestId,
    newPassword,
    newPasswordRepeat
  }: {
    requestId: string
    newPassword: string
    newPasswordRepeat: string
  }): Promise<UserData | ServerError> {
    if (newPassword !== newPasswordRepeat) throw new ValidationError('Passwords is not match')

    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/forgot/${requestId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword1: newPassword,
          newPassword2: newPasswordRepeat
        }),
        method: 'PUT'
      }
    )

    const data = userResponseFormatter(res)

    return data
  }
}

export { Auth }
