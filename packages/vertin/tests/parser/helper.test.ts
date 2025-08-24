import { describe, expect, it } from 'vitest'
import {
  defineArgumentOptions,
  defineFlagOptions,
  defineParserOption,
} from '@/parser/helper'

describe('defineArgumentOptions', () => {
  it('should return the same object for simple argument options', () => {
    const options = {
      input: { resolver: String, required: true },
      count: { resolver: Number, default: 1 },
    }

    const result = defineArgumentOptions(options)

    expect(result).toBe(options)
    expect(result.input).toEqual({ resolver: String, required: true })
    expect(result.count).toEqual({ resolver: Number, default: 1 })
  })

  it('should handle boolean resolvers', () => {
    const options = {
      enabled: { resolver: Boolean, default: false },
    }

    const result = defineArgumentOptions(options)

    expect(result.enabled).toEqual({ resolver: Boolean, default: false })
  })

  it('should handle function resolvers', () => {
    const customResolver = (input: string) => input.toUpperCase()
    const options = {
      name: { resolver: customResolver, required: true },
    }

    const result = defineArgumentOptions(options)

    expect(result.name).toEqual({ resolver: customResolver, required: true })
  })
})

describe('defineFlagOptions', () => {
  it('should return the same object for simple flag options', () => {
    const options = {
      verbose: { resolver: Boolean, default: false },
      dryRun: { resolver: Boolean },
    }

    const result = defineFlagOptions(options)

    expect(result).toBe(options)
    expect(result.verbose).toEqual({ resolver: Boolean, default: false })
    expect(result.dryRun).toEqual({ resolver: Boolean })
  })

  it('should handle flags with aliases', () => {
    const options = {
      help: { resolver: Boolean, alias: 'h' },
      version: { resolver: Boolean, alias: ['v', 'V'] },
    }

    const result = defineFlagOptions(options)

    expect(result.help).toEqual({ resolver: Boolean, alias: 'h' })
    expect(result.version).toEqual({ resolver: Boolean, alias: ['v', 'V'] })
  })
})

describe('defineParserOption', () => {
  it('should return the same object for simple parser options', () => {
    const option = {
      resolveUnknown: 'block' as const,
      arguments: {
        file: { resolver: String, required: true },
      },
      flags: {
        debug: { resolver: Boolean, default: false },
      },
    }

    const result = defineParserOption(option)

    expect(result).toBe(option)
    expect(result.resolveUnknown).toBe('block')
    expect(result.arguments?.file).toEqual({ resolver: String, required: true })
    expect(result.flags?.debug).toEqual({ resolver: Boolean, default: false })
  })

  it('should handle parser options without arguments or flags', () => {
    const option = {
      resolveUnknown: 'ignore' as const,
      resolveAlias: true,
    }

    const result = defineParserOption(option)

    expect(result).toBe(option)
    expect(result.resolveUnknown).toBe('ignore')
    expect(result.resolveAlias).toBe(true)
  })

  it('should handle parser options with development options', () => {
    const option = {
      resolveUnknown: 'include' as const,
      __dev__: {
        verbose: true,
      },
    }

    const result = defineParserOption(option)

    expect(result).toBe(option)
    expect(result.__dev__?.verbose).toBe(true)
  })
})
