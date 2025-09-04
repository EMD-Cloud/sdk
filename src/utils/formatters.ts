import { ValidationError } from 'src/errors/ValidationError'
import { ResponseData } from 'src/types/fetch'

export function responseFormatter(res: ResponseData): ResponseData['data'] {
  if (!res.data) throw new ValidationError('Property "data" is not exist')

  return res.data
}
