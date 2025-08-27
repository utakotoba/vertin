import type { Command } from './types/command'

/**
 * Represents the state of a command matching operation
 */
export interface CommandMatchState {
  /** The matched command, if any */
  command?: Command
  /** Remaining arguments after command matching */
  remainingArgs: string[]
  /** The path of matched commands */
  matchedPath: string[]
}

/**
 * Performs depth-first search to match commands in the command tree
 *
 * @param argv - The command line arguments array
 * @param currentLevelCommands - Commands available at the current level
 * @param index - Current position in the argv array
 * @param path - Current command path being built
 * @returns CommandMatchState with the matched command and remaining arguments
 */
export function DFSMatch(
  argv: string[],
  currentLevelCommands: Command[],
  index: number,
  path: string[],
): CommandMatchState {
  if (index >= argv.length) {
    return {
      command: undefined,
      remainingArgs: [],
      matchedPath: path,
    }
  }

  const token = argv[index]
  const commandsLength = currentLevelCommands.length

  // iterate through commands to find exact match
  for (let i = 0; i < commandsLength; i++) {
    const command = currentLevelCommands[i]

    if (command.exec.name === token) {
      // build new path efficiently
      const newPath = path.length === 0 ? [token] : [...path, token]

      // check if command has subcommands and continue search
      const subCommands = command.subCommands
      if (subCommands && subCommands.length > 0) {
        const result = DFSMatch(argv, subCommands, index + 1, newPath)
        if (result.command) {
          return result
        }
      }

      // return this command as the match
      return {
        command,
        remainingArgs: argv.slice(index + 1),
        matchedPath: newPath,
      }
    }
  }

  // no match found at current level
  return {
    command: undefined,
    remainingArgs: argv.slice(index),
    matchedPath: path,
  }
}

/**
 * Matches command line arguments against available commands
 *
 * @param argv - The command line arguments array (typically process.argv)
 * @param topLevelCommands - Array of top-level commands to match against
 * @param rootCommand - Optional root command to fall back to if no matches found
 * @param startIndex - Starting index in argv (defaults to 2 to skip node and script path)
 * @returns CommandMatchState with the matched command and remaining arguments
 * @throws {Error} When no commands are available for matching
 */
export function matchCommands(
  argv: string[],
  topLevelCommands: Command[],
  rootCommand?: Command,
  startIndex: number = 2,
): CommandMatchState {
  if (topLevelCommands.length === 0 && !rootCommand) {
    throw new Error('No commands available for matching')
  }

  // handle case where only root command exists
  if (topLevelCommands.length === 0) {
    return {
      command: rootCommand,
      remainingArgs: argv.slice(startIndex),
      matchedPath: [],
    }
  }

  // attempt to match with top-level commands
  const result = DFSMatch(argv, topLevelCommands, startIndex, [])

  // fallback to root command if no match found and root command exists
  if (!result.command && rootCommand) {
    return {
      command: rootCommand,
      remainingArgs: argv.slice(startIndex),
      matchedPath: [],
    }
  }

  return result
}
