import type { ParserOption } from '@/parser/types/options'
import { describe, expect, it } from 'vitest'
import { createParserContext } from '@/parser/context'
import { createInitialState } from '@/parser/state'

describe('createInitialState', () => {
  it('should create initial state with empty context', () => {
    const options: ParserOption = {}
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.currentIndex).toBe(0)
    expect(state.currentArgIndex).toBe(0)
    expect(state.result.arguments).toEqual({})
    expect(state.result.flags).toEqual({})
    expect(state.context).toBe(context)
  })

  it('should initialize flags with default values', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean, default: false },
        help: { resolver: Boolean, default: true },
        count: { resolver: Number, default: 5 },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.result.flags).toEqual({
      verbose: false,
      help: true,
      count: 5,
    })
    expect(state.result.arguments).toEqual({})
  })

  it('should initialize arguments with default values', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String, default: 'default.txt' },
        limit: { resolver: Number, default: 10 },
        enabled: { resolver: Boolean, default: true },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.result.arguments).toEqual({
      input: 'default.txt',
      limit: 10,
      enabled: true,
    })
    expect(state.result.flags).toEqual({})
  })

  it('should initialize both flags and arguments with defaults', () => {
    const options: ParserOption = {
      flags: {
        debug: { resolver: Boolean, default: false },
        quiet: { resolver: Boolean, default: true },
      },
      arguments: {
        file: { resolver: String, default: 'config.json' },
        port: { resolver: Number, default: 8080 },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.result.flags).toEqual({
      debug: false,
      quiet: true,
    })
    expect(state.result.arguments).toEqual({
      file: 'config.json',
      port: 8080,
    })
  })

  it('should not initialize required parameters', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String, required: true },
        verbose: { resolver: Boolean, default: false },
      },
      arguments: {
        input: { resolver: String, required: true },
        output: { resolver: String, default: 'output.txt' },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.result.flags).toEqual({
      verbose: false,
    })
    expect(state.result.arguments).toEqual({
      output: 'output.txt',
    })
  })

  it('should handle optional parameters without defaults', () => {
    const options: ParserOption = {
      flags: {
        help: { resolver: Boolean }, // optional, no default
        version: { resolver: Boolean, default: false },
      },
      arguments: {
        name: { resolver: String }, // optional, no default
        count: { resolver: Number, default: 1 },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.result.flags).toEqual({
      version: false,
    })
    expect(state.result.arguments).toEqual({
      count: 1,
    })
  })

  it('should handle complex default values', () => {
    const options: ParserOption = {
      flags: {
        mode: { resolver: String, default: 'production' },
        timeout: { resolver: Number, default: 30000 },
        enabled: { resolver: Boolean, default: true },
      },
      arguments: {
        path: { resolver: String, default: '/usr/local/bin' },
        maxRetries: { resolver: Number, default: 3 },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.result.flags).toEqual({
      mode: 'production',
      timeout: 30000,
      enabled: true,
    })
    expect(state.result.arguments).toEqual({
      path: '/usr/local/bin',
      maxRetries: 3,
    })
  })

  it('should handle empty flags and arguments objects', () => {
    const options: ParserOption = {
      flags: {},
      arguments: {},
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.result.flags).toEqual({})
    expect(state.result.arguments).toEqual({})
  })

  it('should preserve context reference', () => {
    const options: ParserOption = {
      flags: {
        test: { resolver: Boolean, default: true },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(state.context).toBe(context)
    expect(state.context.options).toBe(options)
  })
})
