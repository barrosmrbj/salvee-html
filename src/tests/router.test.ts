import { describe, it, expect } from 'vitest'
import { parseParams } from '@/router'

describe('parseParams', () => {
  it('returns empty object for routes with no params', () => {
    const params = parseParams('/feed', '/feed')
    expect(params).toEqual({})
  })

  it('extracts a single param', () => {
    const params = parseParams('/institution/:id', '/institution/abc-123')
    expect(params).toEqual({ id: 'abc-123' })
  })

  it('extracts multiple params', () => {
    const params = parseParams('/donate/:institutionId', '/donate/inst-42')
    expect(params).toEqual({ institutionId: 'inst-42' })
  })
})
