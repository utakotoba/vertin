import type { ParserArgumentOption, ParserFlagOption } from './parameters'

/**
 * @name ParserOptions
 * @description Configuration options for a parser.
 */
export interface ParserOptions {
  /**
   * Determines how the parser should handle unknown parameters.
   * - `'ignore'` : silently skip unknown parameters
   * - `'preserve'` : keep unknown parameters in the output
   * - `'block'` : throw an error on unknown parameters
   */
  readonly resolveUnknown?: 'ignore' | 'preserve' | 'block'

  /**
   * Whether to automatically convert kebab-case flags to camelCase.
   */
  readonly autoCastCase?: boolean

  /**
   * Definitions for positional argument parameters.
   */
  readonly arguments?: Record<string, ParserArgumentOption>

  /**
   * Definitions for flags parameters.
   */
  readonly flags?: Record<string, ParserFlagOption>

  /**
   * Development-only options for debugging or verbose logging.
   */
  readonly __dev__?: {
    /**
     * Enable verbose logging for development purposes.
     */
    readonly verbose?: boolean
  }
}
