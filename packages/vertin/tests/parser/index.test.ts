import type { ParserOption } from '@/parser/types/options'
import { describe, expect, it } from 'vitest'
import { createParser } from '@/parser/index'

describe('createParser', () => {
  it('should create parser with empty options', () => {
    const options: ParserOption = {}
    const parser = createParser(options)
    const result = parser(['node', 'script.js'])

    expect(result.arguments).toEqual({})
    expect(result.flags).toEqual({})
  })

  it('should parse flags correctly', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean },
        help: { resolver: Boolean, alias: 'h' },
        config: { resolver: String },
        port: { resolver: Number },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', '--verbose', '-h', '--config', 'config.json', '--port', '8080']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
      help: true,
      config: 'config.json',
      port: 8080,
    })
    expect(result.arguments).toEqual({})
  })

  it('should parse arguments correctly', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String },
        count: { resolver: Number },
        enabled: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', 'file.txt', '5', 'true']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      input: 'file.txt',
      count: 5,
      enabled: true,
    })
    expect(result.flags).toEqual({})
  })

  it('should parse mixed flags and arguments', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean },
        config: { resolver: String },
      },
      arguments: {
        input: { resolver: String },
        output: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', '--verbose', 'input.txt', '--config', 'config.json', 'output.txt']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
      config: 'config.json',
    })
    expect(result.arguments).toEqual({
      input: 'input.txt',
      output: 'output.txt',
    })
  })

  it('should handle default values', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean, default: false },
        port: { resolver: Number, default: 3000 },
      },
      arguments: {
        input: { resolver: String, default: 'default.txt' },
        count: { resolver: Number, default: 1 },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: false,
      port: 3000,
    })
    expect(result.arguments).toEqual({
      input: 'default.txt',
      count: 1,
    })
  })

  it('should validate required parameters', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String, required: true },
      },
      arguments: {
        input: { resolver: String, required: true },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js']

    expect(() => parser(argv)).toThrow()
  })

  it('should handle required parameters when provided', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String, required: true },
      },
      arguments: {
        input: { resolver: String, required: true },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', '--config', 'config.json', 'input.txt']
    const result = parser(argv)

    expect(result.flags).toEqual({
      config: 'config.json',
    })
    expect(result.arguments).toEqual({
      input: 'input.txt',
    })
  })

  it('should handle unknown flags with ignore strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'ignore',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', '--unknown', '--known']
    const result = parser(argv)

    expect(result.flags).toEqual({
      known: true,
    })
  })

  it('should handle unknown flags with include strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', '--unknown', '--known']
    const result = parser(argv)

    expect(result.flags).toEqual({
      unknown: true,
      known: true,
    })
  })

  it('should throw error for unknown flags with block strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'block',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', '--unknown']

    expect(() => parser(argv)).toThrow('Unknown flag: --unknown')
  })

  it('should handle excess arguments with ignore strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'ignore',
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', 'input.txt', 'excess.txt']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      input: 'input.txt',
    })
  })

  it('should throw error for excess arguments with block strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'block',
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', 'input.txt', 'excess.txt']

    expect(() => parser(argv)).toThrow('Unexpected argument: excess.txt')
  })

  it('should handle arguments with count > 1', () => {
    const options: ParserOption = {
      arguments: {
        files: { resolver: String, count: 3 },
        output: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', 'file1.txt', 'file2.txt', 'file3.txt', 'output.txt']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      files: ['file1.txt', 'file2.txt', 'file3.txt'],
      output: 'output.txt',
    })
  })

  it('should handle rest arguments with count: all', () => {
    const options: ParserOption = {
      arguments: {
        files: { resolver: String, count: 'all' },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', 'file1.txt', 'file2.txt', 'file3.txt', 'file4.txt']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      files: ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt'],
    })
  })

  it('should handle complex resolver chains', () => {
    const customResolver = (input: string) => input.toUpperCase()
    const options: ParserOption = {
      flags: {
        mode: { resolver: [String, customResolver] },
      },
      arguments: {
        name: { resolver: [String, customResolver] },
      },
    }
    const parser = createParser(options)
    const argv = ['node', 'script.js', '--mode', 'production', 'test']
    const result = parser(argv)

    expect(result.flags).toEqual({
      mode: 'PRODUCTION',
    })
    expect(result.arguments).toEqual({
      name: 'TEST',
    })
  })

  it('should handle empty argv array', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean, default: false },
      },
      arguments: {
        input: { resolver: String, default: 'default.txt' },
      },
    }
    const parser = createParser(options)
    const result = parser([])

    expect(result.flags).toEqual({
      verbose: false,
    })
    expect(result.arguments).toEqual({
      input: 'default.txt',
    })
  })

  it('should handle single element argv array', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean, default: false },
      },
    }
    const parser = createParser(options)
    const result = parser(['node'])

    expect(result.flags).toEqual({
      verbose: false,
    })
    expect(result.arguments).toEqual({})
  })
})
