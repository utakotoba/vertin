import type { AppOption } from './types/app'
import type { Command } from './types/command'
import { isNotEmpty } from './utils'

/**
 * Validates app option metadata and command structure
 */
export function validateAppOption(option: AppOption): void {
  if (!isNotEmpty(option.name)) {
    throw new Error('App option must include non-empty `name` property')
  }

  if (!isNotEmpty(option.description)) {
    throw new Error('App option must include non-empty `description` property')
  }

  if (!isNotEmpty(option.version)) {
    throw new Error('App option must include non-empty `version` property')
  }

  if (option.rootCommand === undefined) {
    if (option.commands === undefined) {
      throw new Error('App option must include either `rootCommand` or `commands` property')
    }

    if (Array.isArray(option.commands) && option.commands.length === 0) {
      throw new Error('App option `commands` array cannot be empty')
    }
  }
}

/**
 * Validates root command structure and metadata
 */
export function validateRootCommand(rootCommand: Command): void {
  if (!isNotEmpty(rootCommand.metadata.description)) {
    throw new Error('Root command must include non-empty `metadata.description` property')
  }

  if (typeof rootCommand.handler !== 'function') {
    throw new TypeError('Root command must include a valid `handler` function')
  }

  if (rootCommand.subCommands !== undefined && rootCommand.subCommands.length !== 0) {
    throw new Error('Root command should not contain subCommands')
  }
}

/**
 * Validates command array for duplicates and individual command structure
 */
export function validateCommands(commands: Command[]): void {
  const execNames = new Set<string>()

  for (const command of commands) {
    const execName = command.exec.name

    if (execNames.has(execName)) {
      throw new Error(`Duplicate execName '${execName}' found in commands at the same level`)
    }

    execNames.add(execName)
    validateCommand(command)
  }
}

/**
 * Validates individual command metadata and recursively validates subcommands
 */
function validateCommand(command: Command): void {
  if (!isNotEmpty(command.metadata.name)) {
    throw new Error(`Command '${command.exec.name}' must include non-empty 'metadata.name' property`)
  }

  if (!isNotEmpty(command.metadata.description)) {
    throw new Error(`Command '${command.exec.name}' must include non-empty 'metadata.description' property`)
  }

  if (typeof command.handler !== 'function') {
    throw new TypeError(`Command '${command.exec.name}' must include a valid 'handler' function`)
  }

  if (command.subCommands !== undefined) {
    validateCommands(command.subCommands)
  }
}
