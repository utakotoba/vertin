import type { _Parsed, ArgumentParameterOption, FlagParameterOption } from '@/parser'

/**
 * User-side option definition for a command.
 *
 * Control how the command is executed and what parameters it accepts.
 *
 * This interface will be used in helper function to provide
 * auto type inference for the command context. It will be converted
 * to a {@link Command} type together with a {@link CommandHandler},
 * hide the complexity of creating the command runtime information manually.
 */
export interface CommandOption {
  // ======================
  // [Command Metadata]
  // ======================

  /**
   * The name of the command.
   *
   * This will be used as the default display name throughout the app.
   *
   * If {@link execName} is not provided,
   * this name will also be used as the command's executable name.
   */
  readonly name: string

  /**
   * The description of the command.
   *
   * This will be used as the command's description throughout the app.
   *
   * It must be a non-empty string to ensure a better user experience.
   */
  readonly description: string

  /**
   * The version of the command.
   *
   * It will fallback to the root CLI's version if not provided.
   */
  readonly version?: string

  // ======================
  // [Command Parameters]
  // ======================

  /**
   * The executable name of the command.
   *
   * If not provided, the command's {@link name} will be used as the executable name.
   */
  readonly execName?: string

  /**
   * The arguments of the command.
   *
   * This will be used to parse the command's arguments.
   */
  readonly arguments?: Record<string, ArgumentParameterOption>

  /**
   * The flags of the command.
   *
   * This will be used to parse the command's flags.
   */
  readonly flags?: Record<string, FlagParameterOption>

  // ======================
  // [Command Resolving]
  // ======================

  /**
   * The subcommands of the command.
   */
  readonly subCommands?: Command[]
}

/**
 * The execution context of a command, used in user code.
 *
 * This will provide the typed parsed arguments and flags,
 * as well other useful context for the command handler,
 * providing a well DX with intellisense.
 */
export type CommandContext<T extends CommandOption = CommandOption>
  = _Parsed<never, T['arguments'], T['flags']> & {
    // TODO: add more useful context here
  }

/**
 * The handler of a command.
 *
 * This will be used to execute the command.
 *
 * It can be a synchronous or asynchronous function,
 * and it will be called with the {@link CommandContext}.
 */
export type CommandHandler<T extends CommandOption = CommandOption>
 = ((context: CommandContext<T>) => void)
   | ((context: CommandContext<T>) => Promise<void>)

/**
 * The command runtime information under the hood.
 *
 * This is the complete representation of a command,
 * including the metadata, executable name, arguments,
 * flags, and handler in one single object.
 *
 * It is mostly used internally by Vertin to execute the command,
 * and it is **not recommended** to create one manually, consider using
 * **helper functions** to create it instead.
 */
export interface Command {
  /**
   * The metadata of the command.
   */
  readonly metadata: {
    /**
     * The display name of the command.
     */
    readonly name: string

    /**
     * The description of the command.
     */
    readonly description: string

    /**
     * The version string of the command.
     */
    readonly version?: string
  }

  /**
   * The executable configuration of the command.
   */
  readonly exec: {
    /**
     * The executable name of the command.
     */
    readonly name: string

    /**
     * The arguments metadata of the command.
     */
    readonly arguments: Record<string, ArgumentParameterOption>

    /**
     * The flags metadata of the command.
     */
    readonly flags: Record<string, FlagParameterOption>
  }

  /**
   * The handler of the command to execute user code with {@link CommandContext}.
   */
  readonly handler: CommandHandler

  /**
   * The subcommands of the command.
   */
  readonly subCommands?: Command[]
}
