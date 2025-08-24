import type { ArgumentParameterOption, FlagParameterOption } from './parameters'

/**
 * Configuration options for the parser.
 *
 * Controls how the parser resolves input, interprets parameters,
 * and behaves in development/debug modes.
 */
export interface ParserOption {
  // ======================
  // [Resolving]
  // ======================

  /**
   * Whether to resolve parameter aliases into their canonical names.
   *
   * If `true`, aliases defined for arguments or flags will be automatically
   * normalized to their main key.
   *
   * @default true
   */
  readonly resolveAlias?: boolean

  /**
   * Whether a to resolve flags after arguments.
   *
   * Flags must be specified before any argument if enabled,
   * otherwise it will be blocked.
   *
   * @default false
   */
  readonly resolveFlagAfterArgument?: boolean

  /**
   * How unknown arguments or flags should be handled.
   *
   * - `"ignore"` → Unknown keys are discarded.
   * - `"include"` → Unknown keys are preserved in the parsed result.
   * - `"block"` → Parsing fails on unknown keys.
   *
   * @default 'ignore'
   */
  readonly resolveUnknown?: 'ignore' | 'include' | 'block'

  // ======================
  // [Parameters]
  // ======================

  /**
   * Map of argument parameter definitions.
   *
   * Each key represents a named argument, with its resolution options
   * defined by {@link ArgumentParameterOption}.
   */
  readonly arguments?: Record<string, ArgumentParameterOption>

  /**
   * Map of flag parameter definitions.
   *
   * Each key represents a named flag, with its resolution options
   * defined by {@link FlagParameterOption}.
   */
  readonly flags?: Record<string, FlagParameterOption>

  // ======================
  // [Development]
  // ======================

  /**
   * Development-only options for debugging or diagnostics.
   *
   * @private
   */
  readonly __dev__?: {
    /**
     * Enables verbose logging for debugging.
     *
     * If `true`, additional information about parsing decisions
     * and intermediate states may be output.
     *
     * @default false
     * @private
     */
    readonly verbose?: boolean
  }
}
