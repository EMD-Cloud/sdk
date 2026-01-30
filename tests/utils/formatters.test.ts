import { describe, it, expect } from 'vitest'
import { responseFormatter } from 'src/utils/formatters'
import { ValidationError } from 'src/errors/ValidationError'

describe('responseFormatter', () => {
  it('returns data field from response', () => {
    const res = { success: true as const, data: { foo: 'bar' } }
    expect(responseFormatter(res)).toEqual({ foo: 'bar' })
  })

  it('throws ValidationError when data is missing', () => {
    const res = { success: true } as any
    expect(() => responseFormatter(res)).toThrow(ValidationError)
    expect(() => responseFormatter(res)).toThrow('Property "data" is not exist')
  })

  it('returns array data from list response', () => {
    const res = { success: true as const, data: [{ id: 1 }, { id: 2 }], count: 2 }
    expect(responseFormatter(res)).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('returns primitive data from single unit response', () => {
    const res = { success: true as const, data: 42 }
    expect(responseFormatter(res)).toBe(42)
  })
})
