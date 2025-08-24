import type { _ParserContext } from './context'
import type { _Parsed, Parser } from './types/index'
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
export function createParser<T extends ParserOption>(options: T): Parser<T> {
  // context as the internal state of the parser
  const context = createParserContext(options)

  return (argv: string[]): _Parsed<T> => {
    return _parse(argv, context)
  }
}

/**
 * Core parsing logic that processes the argv array according to the parser context.
 */
function _parse<T extends ParserOption>(
  argv: string[],
  context: _ParserContext,
): _Parsed<T> {
  let state = createInitialState(context)

  while (state.currentIndex < argv.length) {
    const token = argv[state.currentIndex]

    if (isFlag(token)) {
      state = parseFlag(state, argv)
    }
    else {
      state = parseArgument(state, argv)
    }
  }

  // validate required parameters
  validateRequiredParameters(state)

  return state.result as _Parsed<T>
}
