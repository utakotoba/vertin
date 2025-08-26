import type { _AnyProps } from '@/types/utils'

/**
 * A constructor type resolver.
 *
 * This can be used in two ways:
 * 1. For built-in JavaScript constructors like `String`, `Number`, or `Boolean`.
 * 2. For custom classes that need to be instantiated, such as a class acting
 * as a type factory.
 */
export type CtorResolver = abstract new (...args: any[]) => any

/**
 * A function type resolver.
 *
 * This represents a standard function that can be used to "resolve" a value,
 * typically by performing validation, simple transformation, or factory creation.
 * @example
 * const MyResolver = (input: string) => input.toUpperCase();
 */
export type FnResolver = (...args: any[]) => any

/**
 * A union type for all possible resolvers.
 *
 * This allows a resolver to be either a function type or a constructor type,
 * and can also be an array of either of those types. This is the main entry point
 * for resolver definitions.
 */
export type Resolver = CtorResolver | CtorResolver[] | FnResolver | FnResolver[] // TODO: context inject

/**
 * Resolves a single resolver unit (function or constructor) to its final return type.
 *
 * This utility handles three distinct cases to correctly infer the output type:
 * 1. **Built-in Constructors:** If the resolver is a built-in constructor like
 * `String` or `Number`, it resolves to its corresponding primitive type.
 * 2. **Custom Class Constructors:** If the resolver is a custom class, it
 * returns the instance type of that class.
 * 3. **Function Types:** If the resolver is a function, it preserves the
 * literal return type. This is crucial for maintaining strict type-safety
 * for things like **enums or arrays of possible values**.
 * For example, a function returning `'small' | 'medium'` will resolve to
 * that exact union type, **not** the broader `string`.
 *
 * @private
 */
export type _ResolveUnit<T>
  = T extends StringConstructor ? string
    : T extends NumberConstructor ? number
      : T extends BooleanConstructor ? boolean
        : T extends abstract new (...args: any[]) => infer RT ? RT
          : T extends (...args: any[]) => infer U ? U
            : never

/**
 * A utility that resolves a `Resolver` type to its final output type.
 *
 * It correctly handles single resolvers and arrays of resolvers.
 * For arrays, the final type will also be an array of the resolved unit types.
 *
 * @private
 * @template T The resolver type to be resolved.
 */
export type _Resolve<T extends Resolver>
  = T extends readonly (infer U)[] ? _ResolveUnit<U>[]
    : T extends (infer U)[] ? _ResolveUnit<U>[]
      : _ResolveUnit<T>

/**
 * The base options object for defining a single parameter.
 *
 * @private
 * @template T - The `Resolver` type used to handle the parameter's value.
 */
export type _BaseParameterOption<T extends Resolver = Resolver> = {
  /**
   * The resolver used to handle the parameter's value.
   *
   * It can be used to perform validation and simple pre-transformations.
   */
  readonly resolver: T

  /**
   * Specifies whether the parameter must be provided.
   *
   * If `false`, the parameter can **be omitted**.
   *
   * @default false
   */
  readonly required?: boolean

  /**
   * The default value to use if the parameter is not specified and is not required.
   *
   * The type of this value **must match** the resolved type of the `resolver`.
   */
  readonly default?: _Resolve<T>
} & (
    _Resolve<T> extends any[]
      ? {
        /**
         * Specifies the number of elements to capture for array-based resolvers.
         *
         * Set to `'all'` to capture all remaining elements (spread parameter)
         * Parameters with a `count` of `'all'` must be **unique and ordered last**.
         *
         * @default 1
         */
          readonly count?: number | 'all'
        }
      : Record<never, never>
  )

/**
 * A basic type for defining a positional argument's options.
 *
 * This is a direct alias of internal `_BaseParameterOption` for now.
 *
 * @template T The `Resolver` type for the argument.
 */
export type ArgumentParameterOption<T extends Resolver = Resolver> = _BaseParameterOption<T>

/**
 * An internal utility type for processing and constraining argument options.
 *
 * This type is used internally to ensure that the type inference work properly
 * in helper function building the K(argument name)-V(options) map.
 *
 * @template T The argument options object to be processed.
 * @private
 */
export type _ArgumentParameterOption<T extends _AnyProps<ArgumentParameterOption, 'default'>>
  = T & {
    [K in Exclude<keyof T, keyof ArgumentParameterOption>]: never
  } & {
    default?: _Resolve<T['resolver']>
  }

/**
 * A type for defining a command-line flag's options.
 *
 * It extends `_BaseParameterOption` and adds an `alias` property, allowing
 * a flag to have one or more short names in addition to its main name.
 *
 * @template T The `Resolver` type for the flag.
 */
export type FlagParameterOption<T extends Resolver = Resolver> = _BaseParameterOption<T> & {
  readonly alias?: string | readonly string[]
}

/**
 * An internal utility type for processing and constraining flag options.
 *
 * This type is used internally to ensure that the type inference work properly
 * in helper function building the K(flag name)-V(options) map.
 *
 * @template T The flag options object to be processed.
 * @private
 */
export type _FlagParameterOption<T extends _AnyProps<FlagParameterOption, 'default'>>
  = T & {
    [K in Exclude<keyof T, keyof FlagParameterOption>]: never
  } & {
    default?: _Resolve<T['resolver']>
  }

/**
 * A utility type that generates a typed object of parsed parameters.
 *
 * @template T - A map of parameter names to their option definitions.
 * @private
 */
export type _ParsedParameter<
  T extends Record<string, _BaseParameterOption<any>>,
> = {
  [K in keyof T]:
  T[K]['default'] extends _Resolve<T[K]['resolver']> ? _Resolve<T[K]['resolver']>
    : T[K]['required'] extends true ? _Resolve<T[K]['resolver']>
      : _Resolve<T[K]['resolver']> | undefined
}
