import type { _ParserContext } from './context'
import type { _ArgumentParameterOption, _FlagParameterOption, _Parsed, Parser } from './types/index'
import type { ParserOption } from './types/options'
import { createParserContext } from './context'
import { isFlag, parseArgument, parseFlag, validateRequiredParameters } from './core'
import { createInitialState } from './state'

/**
 * Creates a parser function from parser options.
 *
 * This function pre-processes the parser options into optimized data structures
 * for fast parameter lookup and returns a parser function that can efficiently
 * parse command line arguments according to the specified configuration.
 *
 * @param options - The parser configuration options
 * @returns A parser function that takes argv and returns parsed results
 */
export function createParser<T extends ParserOption>(
  options: T & {
    readonly arguments?: {
      [K in keyof T['arguments']]: _ArgumentParameterOption<NonNullable<T['arguments']>[K]>
    }
    readonly flags?: {
      [K in keyof T['flags']]: _FlagParameterOption<NonNullable<T['flags']>[K]>
    }
  },
): Parser<T> {
  // context as the internal state of the parser
  const context = createParserContext(options)

  return (argv: string[]): _Parsed<T> => {
    return _parse(argv, context)
  }
}

/**
 * Core parsing logic that processes argv tokens sequentially.
 *
 * @param argv - The command line arguments array (should exclude the first two elements)
 * @param context - The parser context
 * @returns The parsed results
 */
function _parse<T extends ParserOption>(
  argv: string[],
  context: _ParserContext,
): _Parsed<T> {
  let state = createInitialState(context)

  let hasEncounteredArguments = false

  // process each token sequentially, routing to appropriate parser
  while (state.currentIndex < argv.length) {
    const token = argv[state.currentIndex]

    if (isFlag(token)) {
      // check if flags are allowed after arguments
      if (!hasEncounteredArguments || context.options.resolveFlagAfterArgument !== false) {
        state = parseFlag(state, argv)
      }
      else {
        // flags not allowed after arguments - always block
        throw new Error(`Flag ${token} cannot appear after arguments`)
      }
    }
    else {
      hasEncounteredArguments = true
      state = parseArgument(state, argv)
    }
  }

  // validate all required parameters are present
  validateRequiredParameters(state)

  return state.result as _Parsed<T>
}

// re-export
export * from './context'
export * from './core'
export * from './state'
export * from './types'
