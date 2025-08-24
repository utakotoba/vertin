import type { _ParserContext } from './context'

/**
 * Internal state for tracking parsing progress and intermediate data.
 */
export interface _ParserState {
  // Current position in argv array
  currentIndex: number

  // Current argument index (position in defined arguments)
  currentArgIndex: number

  // Accumulated parsing results.
  // The type `any` is used here because the resolver has not yet been applied.
  // This is safe, as the values will be cast to the correct types later.
  result: {
    arguments: Record<string, any>
    flags: Record<string, any>
  }

  // Parser context (created from parser options)
  context: _ParserContext
}

/**
 * Creates an initial parser state.
 *
 * @param context - The pre-processed parser context
 * @returns Initial parser state with default values
 */
export function createInitialState(context: _ParserContext): _ParserState {
  const result: {
    arguments: Record<string, any>
    flags: Record<string, any>
  } = {
    arguments: {},
    flags: {},
  }

  // Initialize flags with default values using the pre-computed map
  context.flagDefaults.forEach((defaultValue, name) => {
    result.flags[name] = defaultValue
  })

  // Initialize arguments with default values using the pre-computed map
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
