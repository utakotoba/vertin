import type { ParserOption } from './types/options'
import type { _ArgumentParameterOption, _FlagParameterOption, ArgumentParameterOption, FlagParameterOption } from './types/parameters'

/**
 * Defines a K(name)-V(argument option) of **argument options** for a parser.
 *
 * @typeParam T - A mapping of argument names to their parameter options.
 *
 * @param options - An object where each key is an argument name,
 *   and its value is an {@link _ArgumentParameterOption}.
 *
 * @returns A typed mapping where each argument is resolved
 *   into a finalized {@link ArgumentParameterOption}.
 *
 * @example
 * ```ts
 * const args = defineArgumentOptions({
 *   input: { resolver: String, required: true },
 *   count: { resolver: Number, default: 1 },
 * })
 * ```
 */
export function defineArgumentOptions<
  const T extends Record<string, ArgumentParameterOption>,
>(options: { [K in keyof T]: _ArgumentParameterOption<T[K]> }): {
  [K in keyof T]: ArgumentParameterOption<T[K]['resolver']>
} {
  return options
}

/**
 * Defines a K(name)-V(flag option) of **flag options** for a parser.
 *
 * @typeParam T - A mapping of flag names to their parameter options.
 *
 * @param options - An object where each key is a flag name,
 *   and its value is an {@link _FlagParameterOption}.
 *
 * @returns A typed mapping where each flag is resolved
 *   into a finalized {@link FlagParameterOption}.
 *
 * @example
 * ```ts
 * const flags = defineFlagOptions({
 *   verbose: { resolver: Boolean, default: false },
 *   dryRun: { resolver: Boolean },
 * })
 * ```
 */
export function defineFlagOptions<
  const T extends Record<string, FlagParameterOption>,
>(options: { [K in keyof T]: _FlagParameterOption<T[K]> }): {
  [K in keyof T]: FlagParameterOption<T[K]['resolver']>
} {
  return options
}

/**
 * Defines the full configuration for a parser.
 *
 * This function wraps a {@link ParserOption} object and
 * ensures that `arguments` and `flags` are declared using
 * the safe forms of {@link _ArgumentParameterOption} and
 * {@link _FlagParameterOption}.
 *
 * @typeParam T - The parser option type.
 *
 * @param option - The parser configuration object,
 *   including resolving rules, argument definitions,
 *   and flag definitions.
 *
 * @returns The validated parser configuration as a {@link ParserOption}.
 *
 * @example
 * ```ts
 * const parserOpts = defineParserOption({
 *   resolveUnknown: "block",
 *   arguments: {
 *     file: { resolver: String, required: true },
 *   },
 *   flags: {
 *     debug: { resolver: Boolean, default: false },
 *   },
 * })
 * ```
 */
export function defineParserOption<T extends ParserOption>(
  option: T & {
    readonly arguments?: {
      [K in keyof T['arguments']]: _ArgumentParameterOption<NonNullable<T['arguments']>[K]>
    }
    readonly flags?: {
      [K in keyof T['flags']]: _FlagParameterOption<NonNullable<T['flags']>[K]>
    }
  },
): ParserOption {
  return option
}
