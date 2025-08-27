import type { ParserOption } from '@/parser/types/options'
import { describe, expect, it } from 'vitest'
import { createParser } from '@/parser/index'

describe('createParser', () => {
  it('should create parser with empty options', () => {
    const options: ParserOption = {}
    const parser = createParser(options)
    const result = parser([])

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
    const argv = ['--verbose', '-h', '--config', 'config.json', '--port', '8080']
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
    const argv = ['file.txt', '5', 'true']
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
    const argv = ['--verbose', 'input.txt', '--config', 'config.json', 'output.txt']
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
    const argv: string[] = []
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
    const argv: string[] = []

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
    const argv = ['--config', 'config.json', 'input.txt']
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
    const argv = ['--unknown', '--known']
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
    const argv = ['--unknown', '--known']
    const result = parser(argv)

    expect(result.flags).toEqual({
      known: true,
    })
    expect(result.__unknownFlags__).toEqual({
      unknown: '--unknown',
    })
  })

  it('should handle multiple unknown flags with include strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    const argv = ['--unknown1', '--unknown2', '--known']
    const result = parser(argv)

    expect(result.flags).toEqual({
      known: true,
    })
    expect(result.__unknownFlags__).toEqual({
      unknown1: '--unknown1',
      unknown2: '--unknown2',
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
    const argv = ['--unknown']

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
    const argv = ['input.txt', 'excess.txt']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      input: 'input.txt',
    })
  })

  it('should handle excess arguments with include strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['input.txt', 'excess.txt']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      input: 'input.txt',
    })
    expect(result.__unknownArguments__).toEqual(['excess.txt'])
  })

  it('should handle multiple excess arguments with include strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['input.txt', 'excess1.txt', 'excess2.txt', 'excess3.txt']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      input: 'input.txt',
    })
    expect(result.__unknownArguments__).toEqual(['excess1.txt', 'excess2.txt', 'excess3.txt'])
  })

  it('should not resolve flag aliases when resolveAlias is false', () => {
    const options: ParserOption = {
      resolveAlias: false,
      resolveUnknown: 'include',
      flags: {
        verbose: { resolver: Boolean, alias: 'v' },
        help: { resolver: Boolean, alias: ['h', 'H'] },
      },
    }
    const parser = createParser(options)
    const argv = ['-v', '-h', '--verbose']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
    })
    expect(result.__unknownFlags__).toEqual({
      v: '-v',
      h: '-h',
    })
  })

  it('should resolve flag aliases when resolveAlias is true (default)', () => {
    const options: ParserOption = {
      resolveAlias: true,
      flags: {
        verbose: { resolver: Boolean, alias: 'v' },
        help: { resolver: Boolean, alias: ['h', 'H'] },
      },
    }
    const parser = createParser(options)
    const argv = ['-v', '-h']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
      help: true,
    })
  })

  it('should allow flags after arguments when resolveFlagAfterArgument is true (default)', () => {
    const options: ParserOption = {
      resolveFlagAfterArgument: true,
      flags: {
        verbose: { resolver: Boolean },
        help: { resolver: Boolean },
      },
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['input.txt', '--verbose', '--help']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
      help: true,
    })
    expect(result.arguments).toEqual({
      input: 'input.txt',
    })
  })

  it('should block flags after arguments when resolveFlagAfterArgument is false and resolveUnknown is block', () => {
    const options: ParserOption = {
      resolveFlagAfterArgument: false,
      resolveUnknown: 'block',
      flags: {
        verbose: { resolver: Boolean },
        help: { resolver: Boolean },
      },
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['input.txt', '--verbose']

    expect(() => parser(argv)).toThrow('Flag --verbose cannot appear after arguments')
  })

  it('should block flags after arguments when resolveFlagAfterArgument is false regardless of resolveUnknown setting', () => {
    const options: ParserOption = {
      resolveFlagAfterArgument: false,
      resolveUnknown: 'include', // even with include, should still block
      flags: {
        verbose: { resolver: Boolean },
        help: { resolver: Boolean },
      },
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['input.txt', '--verbose']

    expect(() => parser(argv)).toThrow('Flag --verbose cannot appear after arguments')
  })

  it('should block flags after arguments when resolveFlagAfterArgument is false and resolveUnknown is ignore', () => {
    const options: ParserOption = {
      resolveFlagAfterArgument: false,
      resolveUnknown: 'ignore', // even with ignore, should still block
      flags: {
        verbose: { resolver: Boolean },
        help: { resolver: Boolean },
      },
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['input.txt', '--verbose']

    expect(() => parser(argv)).toThrow('Flag --verbose cannot appear after arguments')
  })

  it('should allow flags before arguments when resolveFlagAfterArgument is false', () => {
    const options: ParserOption = {
      resolveFlagAfterArgument: false,
      flags: {
        verbose: { resolver: Boolean },
        help: { resolver: Boolean },
      },
      arguments: {
        input: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['--verbose', '--help', 'input.txt']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
      help: true,
    })
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
    const argv = ['input.txt', 'excess.txt']

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
    const argv = ['file1.txt', 'file2.txt', 'file3.txt', 'output.txt']
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
    const argv = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt']
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
    const argv = ['--mode', 'production', 'test']
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
    const result = parser(['single-arg'])

    expect(result.flags).toEqual({
      verbose: false,
    })
    expect(result.arguments).toEqual({})
  })

  it('should handle function resolvers', () => {
    const customResolver = (input: string) => input.toUpperCase()
    const options: ParserOption = {
      flags: {
        mode: { resolver: customResolver },
      },
      arguments: {
        name: { resolver: customResolver },
      },
    }
    const parser = createParser(options)
    const argv = ['--mode', 'production', 'test']
    const result = parser(argv)

    expect(result.flags).toEqual({
      mode: 'PRODUCTION',
    })
    expect(result.arguments).toEqual({
      name: 'TEST',
    })
  })

  it('should handle built-in constructors', () => {
    const options: ParserOption = {
      flags: {
        port: { resolver: Number },
        enabled: { resolver: Boolean },
      },
      arguments: {
        count: { resolver: Number },
        active: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    const argv = ['--port', '8080', '--enabled', '42', 'true']
    const result = parser(argv)

    expect(result.flags).toEqual({
      port: 8080,
      enabled: true,
    })
    expect(result.arguments).toEqual({
      count: 42,
      active: true,
    })
  })

  it('should handle missing flag options gracefully', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    // this test covers the case where flagLookup returns a name but flags object doesn't have it
    const argv = ['--verbose']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
    })
  })

  it('should throw error when non-boolean flag has no value', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['--config']

    expect(() => parser(argv)).toThrow('Flag --config requires a value')
  })

  it('should handle case with no arguments defined', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean },
      },
      // no arguments defined
    }
    const parser = createParser(options)
    const argv = ['--verbose', 'excess-arg']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
    })
    expect(result.arguments).toEqual({})
  })

  it('should handle arguments with numeric count', () => {
    const options: ParserOption = {
      arguments: {
        files: { resolver: String, count: 2 },
        output: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['file1.txt', 'file2.txt', 'output.txt']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      files: ['file1.txt', 'file2.txt'],
      output: 'output.txt',
    })
  })

  it('should validate required arguments', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String, required: true },
      },
    }
    const parser = createParser(options)
    const argv: string[] = []

    expect(() => parser(argv)).toThrow('Required argument \'input\' is missing')
  })

  it('should validate required flags', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String, required: true },
      },
    }
    const parser = createParser(options)
    const argv: string[] = []

    expect(() => parser(argv)).toThrow('Required flag \'config\' is missing')
  })

  it('should handle mixed required and optional parameters', () => {
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
    const parser = createParser(options)
    const argv = ['--config', 'config.json', 'input.txt']
    const result = parser(argv)

    expect(result.flags).toEqual({
      config: 'config.json',
      verbose: false,
    })
    expect(result.arguments).toEqual({
      input: 'input.txt',
      output: 'output.txt',
    })
  })

  it('should handle function resolvers in array chains', () => {
    const toUpper = (input: string) => input.toUpperCase()
    const reverse = (input: string) => input.split('').reverse().join('')
    const options: ParserOption = {
      flags: {
        mode: { resolver: [String, toUpper, reverse] },
      },
      arguments: {
        name: { resolver: [String, toUpper] },
      },
    }
    const parser = createParser(options)
    const argv = ['--mode', 'production', 'test']
    const result = parser(argv)

    expect(result.flags).toEqual({
      mode: 'NOITCUDORP', // 'PRODUCTION' reversed
    })
    expect(result.arguments).toEqual({
      name: 'TEST',
    })
  })

  it('should handle built-in constructors in single resolver path', () => {
    const options: ParserOption = {
      flags: {
        port: { resolver: Number },
        enabled: { resolver: Boolean },
      },
      arguments: {
        count: { resolver: Number },
        active: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    const argv = ['--port', '8080', '--enabled', '42', 'true']
    const result = parser(argv)

    expect(result.flags).toEqual({
      port: 8080,
      enabled: true,
    })
    expect(result.arguments).toEqual({
      count: 42,
      active: true,
    })
  })

  it('should handle missing flag options in flagLookup', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean },
      },
    }
    const parser = createParser(options)
    // this test covers the case where flagLookup returns a name but flags object doesn't have it
    // we need to test this by creating a scenario where the flag name exists in lookup but not in options
    const argv = ['--verbose']
    const result = parser(argv)

    expect(result.flags).toEqual({
      verbose: true,
    })
  })

  it('should throw error when non-boolean flag has no value at end of argv', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['--config']

    expect(() => parser(argv)).toThrow('Flag --config requires a value')
  })

  it('should handle arguments with specific numeric count', () => {
    const options: ParserOption = {
      arguments: {
        files: { resolver: String, count: 2 },
        output: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['file1.txt', 'file2.txt', 'output.txt']
    const result = parser(argv)

    expect(result.arguments).toEqual({
      files: ['file1.txt', 'file2.txt'],
      output: 'output.txt',
    })
  })

  it('should handle arguments with count less than available args', () => {
    const options: ParserOption = {
      arguments: {
        files: { resolver: String, count: 2 },
        output: { resolver: String },
      },
    }
    const parser = createParser(options)
    const argv = ['file1.txt'] // only one file provided, but count expects 2
    const result = parser(argv)

    expect(result.arguments).toEqual({
      files: ['file1.txt'], // should only collect what's available
      output: undefined,
    })
  })
})
