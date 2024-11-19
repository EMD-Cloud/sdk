import { ServerError } from 'src/errors/ServerError'
import { ResponseError, ResponseData } from 'src/types/fetch'

export function responseFormatter(
  res: ResponseData | ResponseError
): ResponseData['data'] {
  if (!res.success) throw new ServerError(res.error)

  return res.data
}
