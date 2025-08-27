import type { App, AppOption } from './types/app'
import type { Command, CommandHandler, CommandOption, RootCommandOption } from './types/command'
import type { _ArgumentParameterOption, _FlagParameterOption } from '@/parser'
import { createRuntime } from './core'

/**
 * Defines a command with typed parameters and handler.
 *
 * Creates a command with metadata, executable configuration, and a handler function.
 * The function provides type safety for arguments and flags based on the provided option.
 *
 * @param option - The command configuration including metadata, arguments, and flags
 * @param handler - The function that executes when the command is invoked
 * @returns A {@link Command} object
 *
 * @example
 * ```typescript
 * const command = defineCommand({
 *   name: 'build',
 *   description: 'Build the project',
 *   arguments: {
 *     target: { resolver: String, required: true }
 *   },
 *   flags: {
 *     watch: { resolver: Boolean, default: false }
 *   }
 * }, (context) => {
 *   console.log(`Building ${context.arguments.target} with watch: ${context.flags.watch}`)
 * })
 * ```
 */
export function defineCommand<T extends CommandOption>(
  option: T & {
    readonly arguments?: {
      [K in keyof T['arguments']]: _ArgumentParameterOption<NonNullable<T['arguments']>[K]>
    }
    readonly flags?: {
      [K in keyof T['flags']]: _FlagParameterOption<NonNullable<T['flags']>[K]>
    }
  },
  handler: CommandHandler<T>,
): Command {
  const command: Command = {
    metadata: {
      name: option.name,
      description: option.description,
      version: option.version,
    },
    exec: {
      name: option.execName ?? option.name,
      arguments: option.arguments ?? {},
      flags: option.flags ?? {},
    },
    handler,
    subCommands: option.subCommands,
  }

  return command
}

/**
 * Defines a root command with typed parameters and handler.
 *
 * Creates a root command that represents the default behavior when no subcommand is specified.
 * Unlike regular commands, root commands cannot have metadata (name, description, version) or subcommands
 * as these are inherited from the app configuration.
 *
 * @param option - The root command configuration including arguments and flags
 * @param handler - The function that executes when the root command is invoked
 * @returns A fully configured root command object
 *
 * @example
 * ```typescript
 * const rootCommand = defineRootCommand({
 *   description: 'Default behavior when no command is specified',
 *   flags: {
 *     verbose: { resolver: Boolean, default: false }
 *   }
 * }, (context) => {
 *   if (context.flags.verbose) {
 *     console.log('Verbose mode is enabled')
 *   }
 * })
 * ```
 */
export function defineRootCommand<T extends RootCommandOption>(
  option: T & {
    readonly arguments?: {
      [K in keyof T['arguments']]: _ArgumentParameterOption<NonNullable<T['arguments']>[K]>
    }
    readonly flags?: {
      [K in keyof T['flags']]: _FlagParameterOption<NonNullable<T['flags']>[K]>
    }
  },
  handler: CommandHandler<T>,
): Command {
  const command: Command = {
    metadata: {
      name: '__root__',
      description: '__root_description__',
    },
    exec: {
      name: '__root__',
      arguments: option.arguments ?? {},
      flags: option.flags ?? {},
    },
    handler,
  }

  return command
}

/**
 * Defines a Vertin CLI application.
 *
 * Creates an application with configuration options and a run function.
 *
 * @param option - The application configuration including metadata, commands, etc.
 * @returns A configured application object
 *
 * @example
 * ```typescript
 * const app = defineApp({
 *   name: 'my-cli',
 *   description: 'A command line tool',
 *   version: '1.0.0',
 *   rootCommand: rootCommand,
 *   commands: [buildCommand, testCommand]
 * })
 *
 * // Run the application
 * await app.run()
 * ```
 */
export function defineApp<T extends AppOption>(
  option: T,
): App {
  return {
    option,
    run: createRuntime(option),
  }
}
