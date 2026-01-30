import { BaseModule } from 'src/core/BaseModule'
import { ServerError } from 'src/errors/ServerError'
import type { CallOptions } from 'src/types/common'
import type { WebhookResponse } from 'src/types/webhook'

class Webhook extends BaseModule {
  /**
   * Performs an API request to a specified webhook endpoint and returns the response.
   *
   * This function constructs the URL for the API call, adds necessary headers including authorization,
   * and handles the response by formatting it if needed. It supports customization of the request
   * through requestOptions and callOptions.
   *
   * @param {string} id - The unique identifier for the webhook.
   * @param {RequestInit} requestOptions - The options for the fetch request, such as method, headers, body, etc.
   * @param {CallOptions} callOptions - Additional options for the API call, including authentication type, ignore format response option.
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
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<WebhookResponse | ServerError>
  async call(
    id: string,
    requestOptions: RequestInit,
    callOptions?: CallOptions,
  ): Promise<WebhookResponse['data'] | ServerError>
  async call(
    id: string,
    requestOptions: RequestInit,
    callOptions: CallOptions = {},
  ): Promise<WebhookResponse | WebhookResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authorizationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    return this.request<WebhookResponse>(
      `${apiUrl}/api/${app}/webhook/${id}`,
      {
        ...requestOptions,
        headers: { ...authorizationHeader, ...requestOptions?.headers },
      },
      callOptions,
    )
  }
}

export { Webhook }
