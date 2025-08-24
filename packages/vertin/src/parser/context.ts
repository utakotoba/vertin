import type { ParserOption } from './types/options'

/**
 * _ParserContext holds the pre-processed parser options and lookup maps.
 */
export interface _ParserContext {
  /** The original parser configuration options. */
  options: ParserOption

  /**
   * A map from flag aliases (including the main flag name and all its aliases)
   * to the canonical flag name, for fast O(1) lookup during parsing.
   */
  flagLookup: Map<string, string>

  /**
   * A map from flag names to their default values, for fast O(1) lookup during initialization.
   */
  flagDefaults: Map<string, any>

  /**
   * A map from argument names to their default values, for fast O(1) lookup during initialization.
   */
  argumentDefaults: Map<string, any>
}

/**
 * Creates a parser context from parser options.
 *
 * @param options - The parser configuration options
 * @returns _ParserContext with alias mapping
 */
export function createParserContext(options: ParserOption): _ParserContext {
  const flagLookup = new Map<string, string>()
  const flagDefaults = new Map<string, any>()
  const argumentDefaults = new Map<string, any>()

  // process flags: create alias lookup and default value maps
  if (options.flags) {
    Object.entries(options.flags).forEach(([name, flagOpt]) => {
      // create alias lookup
      const aliases = [name]
      if (flagOpt.alias) {
        const aliasArray = Array.isArray(flagOpt.alias) ? flagOpt.alias : [flagOpt.alias]
        aliases.push(...aliasArray)
      }

      aliases.forEach((alias) => {
        flagLookup.set(alias, name)
      })

      // create default value lookup
      if (flagOpt.default !== undefined) {
        flagDefaults.set(name, flagOpt.default)
      }
      else if (!flagOpt.required) {
        flagDefaults.set(name, undefined)
      }
    })
  }

  // process arguments: create default value maps
  if (options.arguments) {
    Object.entries(options.arguments).forEach(([name, argOpt]) => {
      if (argOpt.default !== undefined) {
        argumentDefaults.set(name, argOpt.default)
      }
      else if (!argOpt.required) {
        argumentDefaults.set(name, undefined)
      }
    })
  }

  return {
    options,
    flagLookup,
    flagDefaults,
    argumentDefaults,
  }
}
