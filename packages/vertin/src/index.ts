// core parser functionality
export { createParser } from './parser'
export { createParserContext } from './parser/context'
export type { _ParserContext as ParserContext } from './parser/context'

// parsing utilities and state management
export { extractFlagName, isFlag, parseArgument, parseFlag, resolveValue, validateRequiredParameters } from './parser/core'
// configuration helpers
export { defineArgumentOptions, defineFlagOptions, defineParserOption } from './parser/helper'
export { createInitialState } from './parser/state'

export type { _ParserState } from './parser/state'

// type definitions
export type { _Parsed, Parser } from './parser/types/index'
export type { ParserOption } from './parser/types/options'
export type { ArgumentParameterOption, FlagParameterOption, Resolver } from './parser/types/parameters'
