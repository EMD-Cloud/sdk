import { ValidationError } from 'src/errors/ValidationError'
import type { Response } from 'src/types/fetch'

export function responseFormatter<T extends Response>(res: T): T['data'] {
  if (!res.data) throw new ValidationError('Property "data" is not exist')

  return res.data
}
