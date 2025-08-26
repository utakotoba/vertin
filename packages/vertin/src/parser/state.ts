import type { _ParserContext } from './context'

/**
 * Internal state for tracking parsing progress and intermediate data.
 */
export interface _ParserState {
  // current position in argv array being processed
  currentIndex: number

  // current argument index (position in defined arguments)
  currentArgIndex: number

  // accumulated parsing results with resolved values
  result: {
    arguments: Record<string, any>
    flags: Record<string, any>
    __unknownFlags__?: Record<string, string>
    __unknownArguments__?: string[]
  }

  // parser context with pre-processed lookup maps
  context: _ParserContext
}

/**
 * Creates an initial parser state with default values from context.
 */
export function createInitialState(context: _ParserContext): _ParserState {
  const result: {
    arguments: Record<string, any>
    flags: Record<string, any>
    __unknownArguments__?: string[]
    __unknownFlags__?: Record<string, string>
  } = {
    arguments: {},
    flags: {},
    __unknownArguments__: [],
    __unknownFlags__: {},
  }

  // initialize flags with default values using pre-computed lookup maps
  context.flagDefaults.forEach((defaultValue, name) => {
    result.flags[name] = defaultValue
  })

  // initialize arguments with default values using pre-computed lookup maps
  context.argumentDefaults.forEach((defaultValue, name) => {
    result.arguments[name] = defaultValue
  })

  return {
    currentIndex: 0,
    currentArgIndex: 0,
    result,
    context,
  }
}
