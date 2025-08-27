import { describe, expect, it } from 'vitest'
import { isNotEmpty } from '@/utils'

describe('isNotEmpty', () => {
  it('should return true for non-empty string', () => {
    expect(isNotEmpty('hello')).toBe(true)
    expect(isNotEmpty('test string')).toBe(true)
    expect(isNotEmpty('a')).toBe(true)
  })

  it('should return false for empty string', () => {
    expect(isNotEmpty('')).toBe(false)
  })

  it('should return false for whitespace-only string', () => {
    expect(isNotEmpty('   ')).toBe(false)
    expect(isNotEmpty('\t')).toBe(false)
    expect(isNotEmpty('\n')).toBe(false)
    expect(isNotEmpty('\r')).toBe(false)
    expect(isNotEmpty(' \t\n\r ')).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isNotEmpty(undefined)).toBe(false)
  })

  it('should return false for null', () => {
    expect(isNotEmpty(null as any)).toBe(false)
  })

  it('should return false for non-string values', () => {
    expect(isNotEmpty(123 as unknown as string)).toBe(false)
    expect(isNotEmpty(true as unknown as string)).toBe(false)
    expect(isNotEmpty(false as unknown as string)).toBe(false)
    expect(isNotEmpty({} as unknown as string)).toBe(false)
    expect(isNotEmpty([] as unknown as string)).toBe(false)
    expect(isNotEmpty((() => {}) as unknown as string)).toBe(false)
  })

  it('should return true for string with leading/trailing whitespace but content', () => {
    expect(isNotEmpty('  hello  ')).toBe(true)
    expect(isNotEmpty('\t\ntest\r')).toBe(true)
    expect(isNotEmpty('  a  ')).toBe(true)
  })
})
