import type { _ParserState } from './state'
import type { _Resolve, Resolver } from './types/parameters'

/**
 * Resolves a string value using the specified resolver.
 *
 * @param value - The string value to resolve
 * @param resolver - The resolver function or constructor
 * @returns The resolved value with proper typing
 */
export function resolveValue<T extends Resolver>(value: string, resolver: T): _Resolve<T> {
  if (Array.isArray(resolver)) {
    // apply multiple resolvers in sequence
    return resolver.reduce((acc, r) => {
      if (typeof r === 'function' && !r.prototype) {
        // function resolver
        return (r as (...args: any[]) => any)(acc)
      }
      else {
        // constructor resolver
        return new (r as any)(acc)
      }
    }, value) as _Resolve<T>
  }
  else if (typeof resolver === 'function' && !resolver.prototype) {
    // function resolver
    return (resolver as (...args: any[]) => any)(value) as _Resolve<T>
  }
  else {
    // constructor resolver
    return new (resolver as any)(value) as _Resolve<T>
  }
}

/**
 * Extracts flag name from a token (removes leading dashes).
 *
 * @param token - The flag token (e.g., "--verbose" or "-v")
 * @returns The flag name without dashes
 */
export function extractFlagName(token: string): string {
  return token.charCodeAt(0) === 45 && token.charCodeAt(1) === 45
    ? token.substring(2)
    : token.substring(1)
}

/**
 * Checks if a token is a flag (starts with dash).
 *
 * @param token - The token to check
 * @returns True if the token is a flag
 */
export function isFlag(token: string): boolean {
  return token.startsWith('-')
}

/**
 * Handles parsing of a flag token.
 *
 * @param state - Current parser state
 * @param argv - The full argv array
 * @returns Updated parser state
 */
export function parseFlag(state: _ParserState, argv: string[]): _ParserState {
  const { context } = state
  const token = argv[state.currentIndex]
  const flagName = extractFlagName(token)
  const mainFlagName = context.flagLookup.get(flagName)

  if (!mainFlagName) {
    // handle unknown flag
    if (context.options.resolveUnknown === 'block') {
      throw new Error(`Unknown flag: ${token}`) // TODO: error pipeline
    }
    else if (context.options.resolveUnknown === 'include') {
      // store unknown flag as-is
      state.result.flags[flagName] = true
    }
    // 'ignore' - do nothing, just move on
    state.currentIndex += 1
    return state
  }

  const flagOpt = context.options.flags?.[mainFlagName]
  if (!flagOpt) {
    state.currentIndex += 1
    return state
  }

  // handle flag value
  if (flagOpt.resolver === Boolean) {
    state.result.flags[mainFlagName] = true
    state.currentIndex += 1
    return state
  }
  else {
    // non-boolean flag needs a value
    if (state.currentIndex + 1 >= argv.length) {
      throw new Error(`Flag ${token} requires a value`)
    }
    const value = argv[state.currentIndex + 1]
    state.result.flags[mainFlagName] = resolveValue(value, flagOpt.resolver)
    state.currentIndex += 2
    return state
  }
}

/**
 * Handles parsing of an argument token.
 *
 * @param state - Current parser state
 * @param argv - The full argv array
 * @returns Updated parser state
 */
export function parseArgument(state: _ParserState, argv: string[]): _ParserState {
  const { context } = state

  if (!context.options.arguments || state.currentArgIndex >= Object.keys(context.options.arguments).length) {
    // handle too many arguments
    if (context.options.resolveUnknown === 'block') {
      const token = argv[state.currentIndex]
      throw new Error(`Unexpected argument: ${token}`)
    }
    else if (context.options.resolveUnknown === 'include') {
      // store in a rest array or similar
    }
    // 'ignore' - do nothing, just move on
    state.currentIndex += 1
    return state
  }

  const argNames = Object.keys(context.options.arguments)
  const currentArgName = argNames[state.currentArgIndex]
  const argOpt = context.options.arguments[currentArgName]

  const count = (argOpt as any).count || 1
  if (count === 'all') {
    // capture all remaining arguments
    const remainingArgs = argv.slice(state.currentIndex)
    state.result.arguments[currentArgName] = remainingArgs.map(arg =>
      resolveValue(arg, argOpt.resolver),
    )
    state.currentIndex = argv.length
    return state
  }
  else {
    const values = []
    let newIndex = state.currentIndex

    for (let j = 0; j < count && newIndex < argv.length; j++) {
      values.push(resolveValue(argv[newIndex], argOpt.resolver))
      newIndex++
    }

    state.result.arguments[currentArgName] = count === 1 ? values[0] : values
    state.currentIndex = newIndex
    state.currentArgIndex += 1
    return state
  }
}

/**
 * Validates that all required parameters are present.
 *
 * @param state - Current parser state
 * @throws Error if required parameters are missing
 */
export function validateRequiredParameters(state: _ParserState): void {
  const { context } = state

  if (context.options.arguments) {
    Object.entries(context.options.arguments).forEach(([name, argOpt]) => {
      if (argOpt.required && state.result.arguments[name] === undefined) {
        throw new Error(`Required argument '${name}' is missing`)
      }
    })
  }

  if (context.options.flags) {
    Object.entries(context.options.flags).forEach(([name, flagOpt]) => {
      if (flagOpt.required && state.result.flags[name] === undefined) {
        throw new Error(`Required flag '${name}' is missing`)
      }
    })
  }
}
