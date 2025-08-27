import type { ParserOption } from './parser'
import type { AppOption, AppRunner } from './types/app'
import type { Command } from './types/command'
import { argv as processArgv } from 'node:process' // temporary workaround
import { matchCommands } from './matcher'
import { createParser } from './parser'
import { validateAppOption } from './validator'

/**
 * Creates a parser for a command with merged options.
 *
 * This function combines the command's parameter definitions with the app's
 * parser options to create a fully configured parser instance.
 *
 * @param command - The command to create a parser for
 * @param appParserOptions - Optional parser options from the app configuration
 * @returns A configured parser function for the command
 */
function createCommandParser(
  command: Command,
  appParserOptions?: AppOption['parserOptions'],
): ReturnType<typeof createParser> {
  const parserOptions: ParserOption = {
    arguments: command.exec.arguments,
    flags: command.exec.flags,
    resolveAlias: appParserOptions?.resolveAlias ?? true,
    resolveFlagAfterArgument: appParserOptions?.resolveFlagAfterArgument ?? true,
    resolveUnknown: appParserOptions?.resolveUnknown ?? 'ignore',
  }

  return createParser(parserOptions)
}

/**
 * Creates the runtime function for a Vertin CLI app.
 *
 * This function validates the app option, prepares the command list,
 * and returns an async runner that matches and executes the appropriate command.
 *
 * @param option - The application configuration
 * @returns An async function that runs the CLI with the given argv
 */
export function createRuntime(
  option: AppOption,
): AppRunner {
  validateAppOption(option)

  const topLevelCommands = option.commands
    ? Array.isArray(option.commands)
      ? option.commands
      : [option.commands]
    : []

  return async (argv?: string[]) => {
    const args = argv ?? processArgv

    // match command using the matcher
    const matchResult = matchCommands(args, topLevelCommands, option.rootCommand)

    if (!matchResult.command) {
      throw new Error('No command found')
    }

    // create parser for the matched command
    const parser = createCommandParser(matchResult.command, option.parserOptions)

    // parse the remaining arguments
    const parsedContext = parser(matchResult.remainingArgs)

    // execute the command with context
    await matchResult.command.handler(parsedContext)
  }
}
