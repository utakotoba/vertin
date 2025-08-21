/**
 * @name BasicResolvableParameter
 * @description Constructor types that the parser can resolve as basic parameter type
 * Supports single values (`StringConstructor`, `NumberConstructor`, `BooleanConstructor`)
 * or array forms (`StringConstructor[]`, etc.) for multi-value parameters.
 */
export type BasicResolvableParameter
  = StringConstructor | StringConstructor[]
    | NumberConstructor | NumberConstructor[]
    | BooleanConstructor | BooleanConstructor[]

/**
 * @name _ResolveParameterType
 * @private
 * @description Utility type to map a {@link BasicResolvableParameter}
 * into its corresponding TypeScript type.
 *
 * - `StringConstructor` → `string`
 * - `NumberConstructor` → `number`
 * - `BooleanConstructor` → `boolean`
 * - `StringConstructor[]` → `string[]`
 * - `NumberConstructor[]` → `number[]`
 * - `BooleanConstructor[]` → `boolean[]`
 */
export type _ResolveParameterType<T extends BasicResolvableParameter>
  = T extends StringConstructor ? string
    : T extends NumberConstructor ? number
      : T extends BooleanConstructor ? boolean
        : T extends StringConstructor[] ? string[]
          : T extends NumberConstructor[] ? number[]
            : T extends BooleanConstructor[] ? boolean[]
              : never

/**
 * @name _ParserBaseOption
 * @private
 * @description Base option shared by both flag and argument definitions.
 * Provides core metadata about the parameter and its type resolution.
 */
export type _ParserBaseOption<T extends BasicResolvableParameter> = {
  /**
   * The constructor used to resolve the parameter.
   * Determines the runtime type (see {@link _ResolveParameterType}).
   */
  readonly type: T

  /**
   * Whether the parameter is required.
   * - `true`: must be explicitly provided.
   * - `false` or omitted: optional.
   *
   * @default false
   */
  readonly required?: boolean

  /**
   * The default value to fall back to if not provided.
   * Must match the resolved type of {@link type} key.
   */
  readonly default?: _ResolveParameterType<T>
} & (
    _ResolveParameterType<T> extends any[]
      ? {
          /**
           * Expected number of values for an array parameter.
           * - A numeric literal (`1`, `2`, etc.) to require that many values.
           * - `"all"` to consume all remaining values. Only the last parameter could set this.
           *
           * @default 1
           */
          readonly count?: number | 'all'
        }
      : Record<never, never>
  )

/**
 * @name ParserArgumentOption
 * @description Option definition for a positional argument parameter.
 * Unlike flags, arguments cannot have aliases.
 */
export type ParserArgumentOption
  = BasicResolvableParameter extends infer T ? (
    T extends BasicResolvableParameter ? _ParserBaseOption<T> : never
  ) : never

/**
 * @name ParserFlagOption
 * @description Option definition for a flag parameter (e.g. `--verbose`).
 * Flags support aliases in addition to the base option fields.
 */
export type ParserFlagOption
  = BasicResolvableParameter extends infer T ? (
    T extends BasicResolvableParameter ? _ParserBaseOption<T> & {
      /**
       * One or more alternative names for the flag.
       * - A single string (e.g. `"v"`).
       * - An array of strings (e.g. `["v", "verb"]`).
       */
      readonly alias?: string | readonly string[]
    } : never
  ) : never

/**
 * @name _ParsedParameter
 * @description
 * Maps a record of `_ParserBaseOption`s to their corresponding runtime values.
 *
 * This type produces a new object type where:
 * 1. Keys corresponding to options with `required: true` are required.
 * 2. Keys corresponding to options with a `default` value are always required,
 *    even if `required` is `false` or omitted.
 * 3. Keys corresponding to options where `required` is `false` or omitted and
 *    `default` is not provided become optional.
 */
export type _ParsedParameter<
  T extends Record<string, _ParserBaseOption<any>>,
> = {
  // Required keys: required:true or default exists
  [K in keyof T as T[K]['required'] extends true
    ? K
    : T[K]['default'] extends undefined
      ? never
      : K
  ]: _ResolveParameterType<T[K]['type']>
} & {
  // Optional keys: required:false/omitted and no default
  [K in keyof T as T[K]['required'] extends true
    ? never
    : T[K]['default'] extends undefined
      ? K
      : never
  ]?: _ResolveParameterType<T[K]['type']>
}
