import type { Command, CommandHandler, CommandOption } from './types/command'
import type { _ArgumentParameterOption, _FlagParameterOption } from '@/parser'

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

export function defineRootCommand<T extends CommandOption>(
  option: T & {
    readonly arguments?: {
      [K in keyof T['arguments']]: _ArgumentParameterOption<NonNullable<T['arguments']>[K]>
    }
    readonly flags?: {
      [K in keyof T['flags']]: _FlagParameterOption<NonNullable<T['flags']>[K]>
    } & {
      // disable metadata and subcommands for root command
      readonly name: never
      readonly description: never
      readonly version: never
      readonly subCommands: never
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
