import type { ParserOption } from '@/parser/types/options'
import { describe, expect, it } from 'vitest'
import { createParserContext } from '@/parser/context'

describe('createParserContext', () => {
  it('should create context with empty options', () => {
    const options: ParserOption = {}
    const context = createParserContext(options)

    expect(context.options).toBe(options)
    expect(context.flagLookup.size).toBe(0)
    expect(context.flagDefaults.size).toBe(0)
    expect(context.argumentDefaults.size).toBe(0)
  })

  it('should process flags with aliases', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean, default: false, alias: 'v' },
        help: { resolver: Boolean, alias: ['h', 'H'] },
        dryRun: { resolver: Boolean },
      },
    }

    const context = createParserContext(options)

    // check flag lookup maps aliases to canonical names
    expect(context.flagLookup.get('verbose')).toBe('verbose')
    expect(context.flagLookup.get('v')).toBe('verbose')
    expect(context.flagLookup.get('help')).toBe('help')
    expect(context.flagLookup.get('h')).toBe('help')
    expect(context.flagLookup.get('H')).toBe('help')
    expect(context.flagLookup.get('dryRun')).toBe('dryRun')

    // check flag defaults
    expect(context.flagDefaults.get('verbose')).toBe(false)
    expect(context.flagDefaults.get('help')).toBe(undefined)
    expect(context.flagDefaults.get('dryRun')).toBe(undefined)
  })

  it('should process flags with single alias', () => {
    const options: ParserOption = {
      flags: {
        debug: { resolver: Boolean, alias: 'd' },
      },
    }

    const context = createParserContext(options)

    expect(context.flagLookup.get('debug')).toBe('debug')
    expect(context.flagLookup.get('d')).toBe('debug')
    expect(context.flagDefaults.get('debug')).toBe(undefined)
  })

  it('should process flags with required flag', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String, required: true },
      },
    }

    const context = createParserContext(options)

    expect(context.flagLookup.get('config')).toBe('config')
    expect(context.flagDefaults.has('config')).toBe(false)
  })

  it('should process arguments with defaults', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String, required: true },
        count: { resolver: Number, default: 1 },
        output: { resolver: String },
      },
    }

    const context = createParserContext(options)

    // check argument defaults
    expect(context.argumentDefaults.has('input')).toBe(false) // required, no default
    expect(context.argumentDefaults.get('count')).toBe(1)
    expect(context.argumentDefaults.get('output')).toBe(undefined)
  })

  it('should process both flags and arguments together', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean, default: false },
        help: { resolver: Boolean, alias: 'h' },
      },
      arguments: {
        file: { resolver: String, required: true },
        limit: { resolver: Number, default: 10 },
      },
    }

    const context = createParserContext(options)

    // check flag processing
    expect(context.flagLookup.get('verbose')).toBe('verbose')
    expect(context.flagLookup.get('help')).toBe('help')
    expect(context.flagLookup.get('h')).toBe('help')
    expect(context.flagDefaults.get('verbose')).toBe(false)
    expect(context.flagDefaults.get('help')).toBe(undefined)

    // check argument processing
    expect(context.argumentDefaults.has('file')).toBe(false)
    expect(context.argumentDefaults.get('limit')).toBe(10)
  })

  it('should handle flags with complex aliases', () => {
    const options: ParserOption = {
      flags: {
        version: { resolver: Boolean, alias: ['v', 'V', 'version'] },
        quiet: { resolver: Boolean, alias: 'q' },
      },
    }

    const context = createParserContext(options)

    // all aliases should map to canonical name
    expect(context.flagLookup.get('version')).toBe('version')
    expect(context.flagLookup.get('v')).toBe('version')
    expect(context.flagLookup.get('V')).toBe('version')
    expect(context.flagLookup.get('quiet')).toBe('quiet')
    expect(context.flagLookup.get('q')).toBe('quiet')
  })

  it('should handle empty flags and arguments objects', () => {
    const options: ParserOption = {
      flags: {},
      arguments: {},
    }

    const context = createParserContext(options)

    expect(context.flagLookup.size).toBe(0)
    expect(context.flagDefaults.size).toBe(0)
    expect(context.argumentDefaults.size).toBe(0)
  })

  it('should handle undefined flags and arguments', () => {
    const options: ParserOption = {
      resolveUnknown: 'ignore',
    }

    const context = createParserContext(options)

    expect(context.flagLookup.size).toBe(0)
    expect(context.flagDefaults.size).toBe(0)
    expect(context.argumentDefaults.size).toBe(0)
  })

  it('should handle optional flags without defaults', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean }, // optional, no default
        help: { resolver: Boolean, required: true }, // required, no default
        debug: { resolver: Boolean, default: false }, // optional, with default
      },
    }

    const context = createParserContext(options)

    // verbose should have undefined default (optional, no default)
    expect(context.flagDefaults.get('verbose')).toBe(undefined)

    // help should not be in defaults (required)
    expect(context.flagDefaults.has('help')).toBe(false)

    // debug should have false default
    expect(context.flagDefaults.get('debug')).toBe(false)
  })

  it('should handle optional arguments without defaults', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String }, // optional, no default
        output: { resolver: String, required: true }, // required, no default
        count: { resolver: Number, default: 1 }, // optional, with default
      },
    }

    const context = createParserContext(options)

    // input should have undefined default (optional, no default)
    expect(context.argumentDefaults.get('input')).toBe(undefined)

    // output should not be in defaults (required)
    expect(context.argumentDefaults.has('output')).toBe(false)

    // count should have 1 default
    expect(context.argumentDefaults.get('count')).toBe(1)
  })
})
