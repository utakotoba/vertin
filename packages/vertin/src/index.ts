// core runtime functionality
export { createRuntime } from './core'
// command definition helpers
export { defineApp, defineCommand, defineRootCommand } from './helper'
// command matching and execution
export { DFSMatch, matchCommands } from './matcher'

export type { CommandMatchState } from './matcher'
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

// utility functions
export { isNotEmpty } from './utils'

// validation utilities
export { validateAppOption, validateCommands, validateRootCommand } from './validator'
