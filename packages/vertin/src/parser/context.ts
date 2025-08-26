import type { ParserOption } from './types/options'

/**
 * Pre-processed parser context with optimized lookup maps for fast parsing.
 */
export interface _ParserContext {
  /** The original parser configuration options. */
  options: ParserOption

  /**
   * Fast O(1) lookup from flag aliases to canonical flag names.
   * Includes both main names and all aliases for each flag.
   */
  flagLookup: Map<string, string>

  /**
   * Fast O(1) lookup for flag default values during state initialization.
   */
  flagDefaults: Map<string, any>

  /**
   * Fast O(1) lookup for argument default values during state initialization.
   */
  argumentDefaults: Map<string, any>
}

/**
 * Creates a pre-processed parser context with optimized lookup maps.
 */
export function createParserContext(options: ParserOption): _ParserContext {
  const flagLookup = new Map<string, string>()
  const flagDefaults = new Map<string, any>()
  const argumentDefaults = new Map<string, any>()

  // process flags: create alias lookup and default value maps
  if (options.flags) {
    Object.entries(options.flags).forEach(([name, flagOpt]) => {
      // build alias list including main name and all aliases
      const aliases = [name]
      if (flagOpt.alias && options.resolveAlias !== false) {
        const aliasArray = Array.isArray(flagOpt.alias) ? flagOpt.alias : [flagOpt.alias]
        aliases.push(...aliasArray)
      }

      // map all aliases to the canonical flag name for O(1) lookup
      aliases.forEach((alias) => {
        flagLookup.set(alias, name)
      })

      // store default values for fast initialization
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
      // store default values for fast initialization
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
