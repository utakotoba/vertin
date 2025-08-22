import type { ArgumentParameterOption, FlagParameterOption } from './parameters'

export interface ParserOption {
  // [Resolving]
  readonly resolveAlias?: boolean
  readonly resolveFlagAfterArgument?: boolean
  readonly resolveUnknown?: 'ignore' | 'include' | 'block'

  // [Parameters]
  readonly arguments?: Record<string, ArgumentParameterOption>
  readonly flags?: Record<string, FlagParameterOption>

  // [Development]
  readonly __dev__?: {
    readonly verbose?: boolean
  }
}
