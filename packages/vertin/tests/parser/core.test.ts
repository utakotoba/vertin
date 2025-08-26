import type { ParserOption } from '@/parser/types/options'
import { describe, expect, it } from 'vitest'
import { createParserContext } from '@/parser/context'
import {
  extractFlagName,
  isFlag,
  parseArgument,
  parseFlag,
  resolveValue,
  validateRequiredParameters,
} from '@/parser/core'
import { createInitialState } from '@/parser/state'

// test the internal isBuiltInConstructor function by testing resolveValue behavior
describe('isBuiltInConstructor', () => {
  it('should identify String constructor as built-in', () => {
    const result = resolveValue('test', String)
    expect(typeof result).toBe('string')
    expect(result).toBe('test')
  })

  it('should identify Number constructor as built-in', () => {
    const result = resolveValue('123', Number)
    expect(typeof result).toBe('number')
    expect(result).toBe(123)
  })

  it('should identify Boolean constructor as built-in', () => {
    const result = resolveValue('true', Boolean)
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })

  it('should handle custom constructors with new', () => {
    class CustomClass {
      value: string
      constructor(value: string) {
        this.value = value
      }
    }

    const result = resolveValue('test', CustomClass)
    expect(result).toBeInstanceOf(CustomClass)
    expect(result.value).toBe('test')
  })

  it('should handle function resolvers', () => {
    const customResolver = (input: string) => input.toUpperCase()
    const result = resolveValue('hello', customResolver)
    expect(typeof result).toBe('string')
    expect(result).toBe('HELLO')
  })

  it('should handle array of resolvers with built-in constructors', () => {
    const resolvers = [String, (s: string) => s.toUpperCase()]
    const result = resolveValue('hello', resolvers)
    expect(typeof result).toBe('string')
    expect(result).toBe('HELLO')
  })

  it('should handle array of resolvers with custom constructors', () => {
    class CustomClass {
      value: string
      constructor(value: string) {
        this.value = value
      }
    }

    const resolvers = [CustomClass]
    const result = resolveValue('hello', resolvers)
    expect(result).toBeInstanceOf(CustomClass)
    expect((result as unknown as CustomClass).value).toBe('hello')
  })

  it('should handle single custom constructor', () => {
    class CustomClass {
      value: string
      constructor(value: string) {
        this.value = value
      }
    }

    const result = resolveValue('hello', CustomClass)
    expect(result).toBeInstanceOf(CustomClass)
    expect(result.value).toBe('hello')
  })
})

describe('resolveValue', () => {
  it('should resolve string values with String constructor', () => {
    const result = resolveValue('test', String)
    expect(result).toBe('test')
  })

  it('should resolve string values with Number constructor', () => {
    const result = resolveValue('123', Number)
    expect(result).toBe(123)
  })

  it('should resolve string values with Boolean constructor', () => {
    const result = resolveValue('true', Boolean)
    expect(result).toBe(true)
  })

  it('should resolve with function resolver', () => {
    const customResolver = (input: string) => input.toUpperCase()
    const result = resolveValue('hello', customResolver)
    expect(result).toBe('HELLO')
  })

  it('should resolve with array of resolvers', () => {
    const resolvers = [String, (s: string) => s.toUpperCase()]
    const result = resolveValue('hello', resolvers)
    expect(result).toBe('HELLO')
  })

  it('should handle complex resolver chain', () => {
    const resolvers = [
      Number,
      (n: number) => n * 2,
      (n: number) => n.toString(),
    ]
    const result = resolveValue('5', resolvers)
    expect(result).toBe('10')
  })
})

describe('extractFlagName', () => {
  it('should extract flag name from single dash', () => {
    expect(extractFlagName('-v')).toBe('v')
    expect(extractFlagName('-help')).toBe('help')
  })

  it('should extract flag name from double dash', () => {
    expect(extractFlagName('--verbose')).toBe('verbose')
    expect(extractFlagName('--dry-run')).toBe('dry-run')
  })

  it('should handle edge cases', () => {
    expect(extractFlagName('-')).toBe('')
    expect(extractFlagName('--')).toBe('')
    expect(extractFlagName('--a')).toBe('a')
  })

  it('should handle single character flags', () => {
    expect(extractFlagName('-a')).toBe('a')
    expect(extractFlagName('-1')).toBe('1')
  })

  it('should handle flags with special characters', () => {
    expect(extractFlagName('--dry-run')).toBe('dry-run')
    expect(extractFlagName('--config-file')).toBe('config-file')
  })
})

describe('isFlag', () => {
  it('should identify flags correctly', () => {
    expect(isFlag('-v')).toBe(true)
    expect(isFlag('--verbose')).toBe(true)
    expect(isFlag('--dry-run')).toBe(true)
  })

  it('should reject non-flags', () => {
    expect(isFlag('file.txt')).toBe(false)
    expect(isFlag('123')).toBe(false)
    expect(isFlag('')).toBe(false)
  })
})

describe('parseFlag', () => {
  it('should parse boolean flags', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean },
        help: { resolver: Boolean },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['--verbose']

    const result = parseFlag(state, argv)

    expect(result.result.flags.verbose).toBe(true)
    expect(result.currentIndex).toBe(1)
  })

  it('should parse flags with values', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String },
        port: { resolver: Number },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['--config', 'config.json', '--port', '8080']

    let result = parseFlag(state, argv)
    expect(result.result.flags.config).toBe('config.json')
    expect(result.currentIndex).toBe(2)

    result = parseFlag(result, argv)
    expect(result.result.flags.port).toBe(8080)
    expect(result.currentIndex).toBe(4)
  })

  it('should handle flag aliases', () => {
    const options: ParserOption = {
      flags: {
        verbose: { resolver: Boolean, alias: 'v' },
        help: { resolver: Boolean, alias: ['h', 'H'] },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['-v', '-h']

    let result = parseFlag(state, argv)
    expect(result.result.flags.verbose).toBe(true)
    expect(result.currentIndex).toBe(1)

    result = parseFlag(result, argv)
    expect(result.result.flags.help).toBe(true)
    expect(result.currentIndex).toBe(2)
  })

  it('should not resolve flag aliases when resolveAlias is false', () => {
    const options: ParserOption = {
      resolveAlias: false,
      flags: {
        verbose: { resolver: Boolean, alias: 'v' },
        help: { resolver: Boolean, alias: ['h', 'H'] },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['-v', '-h']

    let result = parseFlag(state, argv)
    // alias should not be resolved, so -v should be treated as unknown flag
    expect(result.result.flags.verbose).toBeUndefined()
    expect(result.currentIndex).toBe(1)

    result = parseFlag(result, argv)
    // alias should not be resolved, so -h should be treated as unknown flag
    expect(result.result.flags.help).toBeUndefined()
    expect(result.currentIndex).toBe(2)
  })

  it('should still resolve main flag names when resolveAlias is false', () => {
    const options: ParserOption = {
      resolveAlias: false,
      flags: {
        verbose: { resolver: Boolean, alias: 'v' },
        help: { resolver: Boolean, alias: ['h', 'H'] },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['--verbose', '--help']

    let result = parseFlag(state, argv)
    expect(result.result.flags.verbose).toBe(true)
    expect(result.currentIndex).toBe(1)

    result = parseFlag(result, argv)
    expect(result.result.flags.help).toBe(true)
    expect(result.currentIndex).toBe(2)
  })

  it('should capture flag aliases as unknown flags when resolveAlias is false and resolveUnknown is include', () => {
    const options: ParserOption = {
      resolveAlias: false,
      resolveUnknown: 'include',
      flags: {
        verbose: { resolver: Boolean, alias: 'v' },
        help: { resolver: Boolean, alias: ['h', 'H'] },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['-v', '-h', '--verbose']

    let result = parseFlag(state, argv)
    expect(result.result.flags.verbose).toBeUndefined()
    expect(result.result.__unknownFlags__?.v).toBe('-v')
    expect(result.currentIndex).toBe(1)

    result = parseFlag(result, argv)
    expect(result.result.flags.help).toBeUndefined()
    expect(result.result.__unknownFlags__?.h).toBe('-h')
    expect(result.currentIndex).toBe(2)

    result = parseFlag(result, argv)
    expect(result.result.flags.verbose).toBe(true)
    expect(result.currentIndex).toBe(3)
  })

  it('should throw error for unknown flag with block strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'block',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['--unknown']

    expect(() => parseFlag(state, argv)).toThrow('Unknown flag: --unknown')
  })

  it('should include unknown flag with include strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['--unknown']

    const result = parseFlag(state, argv)

    expect(result.result.flags.unknown).toBeUndefined()
    expect(result.result.__unknownFlags__?.unknown).toBe('--unknown')
    expect(result.currentIndex).toBe(1)
  })

  it('should include multiple unknown flags with include strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['--unknown1', '--unknown2', '--known']

    let result = parseFlag(state, argv)
    expect(result.result.flags.unknown1).toBeUndefined()
    expect(result.result.__unknownFlags__?.unknown1).toBe('--unknown1')
    expect(result.currentIndex).toBe(1)

    result = parseFlag(result, argv)
    expect(result.result.flags.unknown2).toBeUndefined()
    expect(result.result.__unknownFlags__?.unknown2).toBe('--unknown2')
    expect(result.currentIndex).toBe(2)

    result = parseFlag(result, argv)
    expect(result.result.flags.known).toBe(true)
    expect(result.currentIndex).toBe(3)
  })

  it('should initialize __unknownFlags__ when it does not exist', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    // manually remove __unknownFlags__ to test initialization (edge case)
    delete state.result.__unknownFlags__
    const argv = ['--unknown']

    const result = parseFlag(state, argv)

    expect(result.result.__unknownFlags__).toBeDefined()
    expect(result.result.__unknownFlags__?.unknown).toBe('--unknown')
  })

  it('should ignore unknown flag with ignore strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'ignore',
      flags: {
        known: { resolver: Boolean },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['--unknown', '--known']

    let result = parseFlag(state, argv)
    expect(result.currentIndex).toBe(1)
    expect(result.result.flags.unknown).toBeUndefined()

    result = parseFlag(result, argv)
    expect(result.result.flags.known).toBe(true)
    expect(result.currentIndex).toBe(2)
  })

  it('should throw error when flag requires value but none provided', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['--config']

    expect(() => parseFlag(state, argv)).toThrow('Flag --config requires a value')
  })

  it('should handle flag option not found', () => {
    const options: ParserOption = {
      flags: {
        known: { resolver: Boolean },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    // manually set a flag name that doesn't exist in the lookup
    const modifiedState = { ...state }
    modifiedState.context.flagLookup.set('unknown', 'nonexistent')

    const argv = ['--unknown']
    const result = parseFlag(modifiedState, argv)

    expect(result.currentIndex).toBe(1)
    expect(result.result.flags.nonexistent).toBeUndefined()
  })
})

describe('parseArgument', () => {
  it('should parse single arguments', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String },
        count: { resolver: Number },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file.txt', '5']

    let result = parseArgument(state, argv)
    expect(result.result.arguments.input).toBe('file.txt')
    expect(result.currentIndex).toBe(1)
    expect(result.currentArgIndex).toBe(1)

    result = parseArgument(result, argv)
    expect(result.result.arguments.count).toBe(5)
    expect(result.currentIndex).toBe(2)
    expect(result.currentArgIndex).toBe(2)
  })

  it('should parse arguments with count > 1', () => {
    const options: ParserOption = {
      arguments: {
        files: { resolver: String, count: 3 },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file1.txt', 'file2.txt', 'file3.txt']

    const result = parseArgument(state, argv)

    expect(result.result.arguments.files).toEqual(['file1.txt', 'file2.txt', 'file3.txt'])
    expect(result.currentIndex).toBe(3)
    expect(result.currentArgIndex).toBe(1)
  })

  it('should parse rest arguments with count: all', () => {
    const options: ParserOption = {
      arguments: {
        files: { resolver: String, count: 'all' },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt']

    const result = parseArgument(state, argv)

    expect(result.result.arguments.files).toEqual(['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt'])
    expect(result.currentIndex).toBe(4)
  })

  it('should handle excess arguments with block strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'block',
      arguments: {
        input: { resolver: String },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file.txt', 'excess.txt']

    // first argument is valid
    const result = parseArgument(state, argv)
    expect(result.result.arguments.input).toBe('file.txt')
    expect(result.currentIndex).toBe(1)
    expect(result.currentArgIndex).toBe(1)

    // second argument should throw
    expect(() => parseArgument(result, argv)).toThrow('Unexpected argument: excess.txt')
  })

  it('should ignore excess arguments with ignore strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'ignore',
      arguments: {
        input: { resolver: String },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file.txt', 'excess.txt']

    let result = parseArgument(state, argv)
    expect(result.result.arguments.input).toBe('file.txt')
    expect(result.currentIndex).toBe(1)
    expect(result.currentArgIndex).toBe(1)

    result = parseArgument(result, argv)
    expect(result.currentIndex).toBe(2)
    expect(result.currentArgIndex).toBe(1) // still 1 because we're ignoring excess
  })

  it('should initialize __unknownArguments__ when it does not exist', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      arguments: {
        input: { resolver: String },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    // manually remove __unknownArguments__ to test initialization
    delete state.result.__unknownArguments__
    const argv = ['file.txt', 'excess.txt']

    let result = parseArgument(state, argv)
    expect(result.result.arguments.input).toBe('file.txt')

    result = parseArgument(result, argv)
    expect(result.result.__unknownArguments__).toBeDefined()
    expect(result.result.__unknownArguments__).toEqual(['excess.txt'])
  })

  it('should handle partial count collection', () => {
    const options: ParserOption = {
      arguments: {
        files: { resolver: String, count: 3 },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file1.txt', 'file2.txt'] // only 2 files, count expects 3

    const result = parseArgument(state, argv)

    expect(result.result.arguments.files).toEqual(['file1.txt', 'file2.txt'])
    expect(result.currentIndex).toBe(2)
    expect(result.currentArgIndex).toBe(1)
  })

  it('should handle single argument with count 1', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String, count: 1 },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file.txt']

    const result = parseArgument(state, argv)

    expect(result.result.arguments.input).toBe('file.txt') // should be single value, not array
    expect(result.currentIndex).toBe(1)
    expect(result.currentArgIndex).toBe(1)
  })

  it('should handle excess arguments with include strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      arguments: {
        input: { resolver: String },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file.txt', 'excess.txt']

    let result = parseArgument(state, argv)
    expect(result.result.arguments.input).toBe('file.txt')
    expect(result.currentIndex).toBe(1)
    expect(result.currentArgIndex).toBe(1)

    result = parseArgument(result, argv)
    expect(result.currentIndex).toBe(2)
    expect(result.currentArgIndex).toBe(1) // still 1 because we're including excess
    expect(result.result.__unknownArguments__).toEqual(['excess.txt'])
  })

  it('should handle multiple excess arguments with include strategy', () => {
    const options: ParserOption = {
      resolveUnknown: 'include',
      arguments: {
        input: { resolver: String },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)
    const argv = ['file.txt', 'excess1.txt', 'excess2.txt', 'excess3.txt']

    let result = parseArgument(state, argv)
    expect(result.result.arguments.input).toBe('file.txt')
    expect(result.currentIndex).toBe(1)
    expect(result.currentArgIndex).toBe(1)

    result = parseArgument(result, argv)
    expect(result.currentIndex).toBe(2)
    expect(result.currentArgIndex).toBe(1)

    result = parseArgument(result, argv)
    expect(result.currentIndex).toBe(3)
    expect(result.currentArgIndex).toBe(1)

    result = parseArgument(result, argv)
    expect(result.currentIndex).toBe(4)
    expect(result.currentArgIndex).toBe(1)

    expect(result.result.__unknownArguments__).toEqual(['excess1.txt', 'excess2.txt', 'excess3.txt'])
  })
})

describe('validateRequiredParameters', () => {
  it('should pass when all required parameters are present', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String, required: true },
      },
      flags: {
        config: { resolver: String, required: true },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    // manually set the required values
    state.result.arguments.input = 'file.txt'
    state.result.flags.config = 'config.json'

    expect(() => validateRequiredParameters(state)).not.toThrow()
  })

  it('should throw error for missing required argument', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String, required: true },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(() => validateRequiredParameters(state)).toThrow('Required argument \'input\' is missing')
  })

  it('should throw error for missing required flag', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String, required: true },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(() => validateRequiredParameters(state)).toThrow('Required flag \'config\' is missing')
  })

  it('should throw error for multiple missing required parameters', () => {
    const options: ParserOption = {
      arguments: {
        input: { resolver: String, required: true },
        output: { resolver: String, required: true },
      },
      flags: {
        config: { resolver: String, required: true },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(() => validateRequiredParameters(state)).toThrow()
  })

  it('should validate required flags correctly', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String, required: true },
        verbose: { resolver: Boolean, required: true },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    expect(() => validateRequiredParameters(state)).toThrow()
  })

  it('should pass validation when all required flags are present', () => {
    const options: ParserOption = {
      flags: {
        config: { resolver: String, required: true },
        verbose: { resolver: Boolean, required: true },
      },
    }
    const context = createParserContext(options)
    const state = createInitialState(context)

    // manually set the required values
    state.result.flags.config = 'config.json'
    state.result.flags.verbose = true

    expect(() => validateRequiredParameters(state)).not.toThrow()
  })
})
