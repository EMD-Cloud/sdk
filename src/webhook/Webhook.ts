import AppOptions from 'src/core/AppOptions'
import { ServerError } from 'src/errors/ServerError'
import { UserData } from 'src/types/user'
import { apiRequest } from 'src/utils/fetch'
import { responseFormatter } from 'src/utils/formatters'
import { CallOptions } from 'src/types/common'
import { WebhookData } from 'src/types/webhook'

class Webhook {
  private applicationOptions: AppOptions

  constructor(applicationOptions: AppOptions) {
    this.applicationOptions = applicationOptions
  }

  /**
   * Performs an API request to a specified webhook endpoint and returns the response.
   *
   * This function constructs the URL for the API call, adds necessary headers including authorization,
   * and handles the response by formatting it if needed. It supports customization of the request
   * through requestOptions and callOptions.
   *
   * @param {string} id - The unique identifier for the webhook.
   * @param {RequestInit} requestOptions - The options for the fetch request, such as method, headers, body, etc.
   * @param {CallOptions} callOptions - Additional options for the API call, including authentication type.
   * @returns {Promise<WebhookData | ServerError>} A promise that resolves to the webhook data on success,
   *                                              or a server error object on failure.
   * @throws {Error} Throws an error if the API request fails.
   * @example
   * const result = await emdCloud.webhook.call('my_webhook', { method: 'POST', body: { title: 'test' } }, { authType: 'api-token' });
   * console.log(result);
   */
  async call(
    id: string,
    requestOptions: RequestInit,
    callOptions: CallOptions,
  ): Promise<WebhookData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authorizationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    const res = await apiRequest(`${apiUrl}/api/${app}/webhook/${id}`, {
      ...requestOptions,
      headers: { ...authorizationHeader, ...requestOptions?.headers },
    })

    let data = res as WebhookData

    if (res.hasOwnProperty('success') && res.hasOwnProperty('data')) {
      data = responseFormatter(res) as WebhookData
    }

    return data
  }
}

export { Webhook }
