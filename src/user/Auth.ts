import AppOptions from 'src/core/AppOptions'
import { ValidationError } from 'src/errors/ValidationError'
import { ServerError } from 'src/errors/ServerError'
import {
  UserData,
  ForgotPassData,
  ForgotPassCheckCodeData,
} from 'src/types/user'
import { apiRequest } from 'src/utils/fetch'
import { responseFormatter } from 'src/utils/formatters'

class Auth {
  private applicationOptions: AppOptions

  constructor(applicationOptions: AppOptions) {
    this.applicationOptions = applicationOptions
  }

  /**
   * Attempts to authorize a user using a stored authentication token.
   *
   * This method retrieves the application's API URL and app identifier from the application options,
   * then uses an existing authentication token to make a POST request to the authorization endpoint.
   * If the token is not present, it throws a ValidationError. After receiving the response, it formats
   * the response data and updates the token stored in the application options with the new token received.
   *
   * @throws {ValidationError} Thrown when the authentication token is missing.
   * @returns {Promise<UserData | ServerError | ValidationError>} Returns a promise that resolves to the user data on successful authorization,
   *         or throws an error (ServerError or ValidationError) if the authorization fails.
   */
  async authorization(): Promise<UserData | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authenticationHeader =
      this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/me`, {
      method: 'POST',
      headers: { ...authenticationHeader },
      body: null,
    })

    const data = responseFormatter(res) as UserData

    this.applicationOptions.setAuthToken(data.token)

    return data
  }

  /**
   * Attempts to log in a user with provided credentials.
   *
   * @param {Object} params - The login parameters.
   * @param {string} params.login - The user's login identifier.
   * @param {string} params.password - The user's password.
   * @returns {Promise<UserData|ServerError>} A promise that resolves with the user data on successful login
   *                                         or a server error response on failure.
   * @throws {Error} Throws an error if the API request fails or the server returns an error.
   * @async
   */
  async login({
    login,
    password,
  }: {
    login: string
    password: string
  }): Promise<UserData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })

    const data = responseFormatter(res) as UserData

    this.applicationOptions.setAuthToken(data.token)

    return data
  }

  /**
   * Asynchronously registers a new user with the provided user details.
   *
   * @param {Object} options - The options for registration.
   * @param {string} [options.firstName] - The first name of the user.
   * @param {string} [options.lastName] - The last name of the user.
   * @param {string} options.login - The login identifier for the user.
   * @param {string} options.password - The password for the user account.
   * @param {Record<string, any>} [options.customFields] - Additional custom fields for the user.
   * @param {string} [options.captchaToken] - A token to verify the request is coming from a human.
   * @returns {Promise<UserData|ServerError>} A promise that resolves to the user data on successful registration
   * or a server error if the registration fails.
   * @async
   * @example
   * await emdCloud.auth.registration({
   *   firstName: 'Jane',
   *   lastName: 'Doe',
   *   login: 'janedoe',
   *   password: 'securepassword123',
   *   customFields: { age: 30 },
   *   captchaToken: 'abcd1234'
   * });
   */
  async registration({
    firstName,
    lastName,
    login,
    password,
    customFields,
    captchaToken,
  }: {
    firstName?: string
    lastName?: string
    login: string
    password: string
    customFields?: Record<string, any>
    captchaToken?: string
  }): Promise<UserData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/register`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        login,
        password,
        customFields,
        captchaToken,
      }),
      method: 'POST',
    })

    const data = responseFormatter(res) as UserData

    this.applicationOptions.setAuthToken(data.token)

    return data
  }

  /**
   * Initiates a password reset process for the user identified by the given email.
   * Sends a password reset request to the server and expects a response.
   * Handles the response by formatting it and returning the relevant data.
   *
   * @param {string} email - The email address of the user who has forgotten their password.
   * @returns {Promise<ForgotPassData | ServerError>} - A promise that resolves with the password reset data
   * or an error if the operation fails. The promise will resolve with either ForgotPassData on success
   * or ServerError on failure.
   * @throws {ServerError} Throws an error if the response from the server indicates a failure.
   * @async
   */
  async forgotPassword(email: string): Promise<ForgotPassData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/forgot`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      method: 'POST',
    })

    const data = responseFormatter(res) as ForgotPassData

    return data
  }

  /**
   * Checks the verification code submitted by the user for password recovery.
   *
   * This method sends a POST request to the server with the verification code
   * provided by the user. It is part of the password recovery process where the
   * user must verify their identity by entering a code that was sent to them.
   *
   * @param {Object} params - The parameters for verifying the password recovery code.
   * @param {string} params.requestId - The unique identifier for the password recovery request.
   * @param {string} params.code - The verification code submitted by the user.
   * @returns {Promise<ForgotPassCheckCodeData|ServerError>} A promise that resolves to the result of the verification process.
   *  If successful, it returns an object containing data related to the password recovery process.
   *  If an error occurs, it returns an object representing the server error.
   * @throws {ServerError} Throws an error if the server response indicates a failure.
   *
   * @example
   * async function verifyCode() {
   *   try {
   *     const response = await emdCloud.auth.forgotPasswordCheckCode({ requestId: '12345', code: '54321' });
   *     console.log('Verification successful:', response);
   *   } catch (error) {
   *     console.error('Verification failed:', error);
   *   }
   * }
   */
  async forgotPasswordCheckCode({
    requestId,
    code,
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
        method: 'POST',
      },
    )

    const data = responseFormatter(res) as ForgotPassCheckCodeData

    return data
  }

  /**
   * Handles the password change process for a user who has forgotten their password.
   * This method verifies that the new passwords match and makes an API request to change the password.
   *
   * @param {Object} params - An object containing the necessary parameters.
   * @param {string} params.requestId - The request ID associated with the password reset request.
   * @param {string} params.newPassword - The new password to be set.
   * @param {string} params.newPasswordRepeat - The new password repeated for verification.
   * @returns {Promise<UserData|ServerError>} A promise that resolves to the user data on successful password change
   * or throws an error if the passwords do not match or if the server responds with an error.
   * @throws {ValidationError} Throws ValidationError if the new passwords do not match.
   * @async
   */
  async forgotPasswordChange({
    requestId,
    newPassword,
    newPasswordRepeat,
  }: {
    requestId: string
    newPassword: string
    newPasswordRepeat: string
  }): Promise<UserData | ServerError> {
    if (newPassword !== newPasswordRepeat)
      throw new ValidationError('Passwords is not match')

    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/forgot/${requestId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword1: newPassword,
          newPassword2: newPasswordRepeat,
        }),
        method: 'PUT',
      },
    )

    const data = responseFormatter(res) as UserData

    return data
  }
}

export { Auth }
