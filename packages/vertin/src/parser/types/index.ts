import type { ParserOption } from './options'
import type { _ParsedParameter } from './parameters'
import type { _KeyCount } from '@/types/utils'

/**
 * Represents the parsed result of a {@link Parser}
 *
 * Both `arguments` and `flags` are conditionally included:
 * - If no arguments or flags are defined, the corresponding property resolves to `never`.
 * - Otherwise, they are resolved into `_ParsedParameter<...>` structures.
 *
 * @template T The full parser option definition.
 * @template A Extracted argument definitions from `T`.
 * @template F Extracted flag definitions from `T`.
 */
export interface _Parsed<
  T extends ParserOption,
  A = T['arguments'],
  F = T['flags'],
> {
  arguments: A extends undefined ? never
    : _KeyCount<NonNullable<A>> extends 0 ? never
      : _ParsedParameter<NonNullable<A>>

  flags: F extends undefined ? never
    : _KeyCount<NonNullable<F>> extends 0 ? never
      : _ParsedParameter<NonNullable<F>>
}

/**
 * A parser function type that takes raw `argv` array and returns a parsed result.
 *
 * The parser is parameterized by a `ParserOption` definition, which specifies
 * the expected arguments and flags. The output is an `_Parsed<T>` type that
 * matches the structure of the input definition.
 *
 * @template T The parser option definition, defaults to `ParserOption`.
 */
export type Parser<T extends ParserOption = ParserOption>
  = (argv: string[]) => _Parsed<T>

// demo
// export function createParser<const T extends ParserOption>(
//   _options: T & {
//     readonly arguments?: {
//       [K in keyof T['arguments']]: NonNullable<T['arguments'][K]> & {
//         readonly default?: _Resolve<NonNullable<T['arguments']>[K]['resolver']>
//       }
//     }
//     readonly flags?: {
//       [K in keyof T['flags']]: NonNullable<T['flags'][K]> & {
//         readonly default?: _Resolve<NonNullable<T['flags']>[K]['resolver']>
//       }
//     }
//   },
// ): Parser<T> {
//   return (_argv: string[]) => {
//     return {
//       arguments: {},
//       flags: {},
//     } as _Parsed<T>
//   }
// }
