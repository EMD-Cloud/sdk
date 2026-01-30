import AppOptions from 'src/core/AppOptions'
import { apiRequest } from 'src/utils/fetch'
import { responseFormatter } from 'src/utils/formatters'
import type { Response } from 'src/types/fetch'
import type { CallOptions } from 'src/types/common'

class BaseModule {
  protected applicationOptions: AppOptions

  constructor(applicationOptions: AppOptions) {
    this.applicationOptions = applicationOptions
  }

  protected async request<T extends Response>(
    url: string,
    fetchOptions: RequestInit,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<T>
  protected async request<T extends Response>(
    url: string,
    fetchOptions: RequestInit,
    callOptions?: CallOptions,
  ): Promise<T['data']>
  protected async request<T extends Response>(
    url: string,
    fetchOptions: RequestInit,
    callOptions: CallOptions = {},
  ): Promise<T | T['data']> {
    const res = await apiRequest(url, fetchOptions)

    if (callOptions.ignoreFormatResponse) {
      return res as T
    }

    return responseFormatter(res) as T['data']
  }
}

export { BaseModule }
