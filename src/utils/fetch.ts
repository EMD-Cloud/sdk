import { ServerError } from 'src/errors/ServerError'
import { Response, ResponseError } from 'src/types/fetch'

export async function apiRequest(
  url: RequestInfo | URL,
  options?: RequestInit,
): Promise<Response> {
  try {
    const response = await fetch(url, options)

    const data = await response.json()

    if (!response.ok) throw data as ResponseError

    return data
  } catch (err) {
    throw new ServerError((err as ResponseError).error)
  }
}
