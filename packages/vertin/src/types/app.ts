import type { Command } from './command'
import type { ParserOption } from '@/parser'

export interface AppOption {
  // ======================
  // [App Metadata]
  // ======================

  /**
   * The display name of a Vertin CLI application.
   */
  readonly name: string

  /**
   * The description of a Vertin CLI application.
   */
  readonly description: string

  /**
   * The version string of current CLI.
   *
   * Unlike the option in command option, this one is required
   * since the command version will always fallback to this if no specified.
   */
  readonly version: string

  // ======================
  // [Commands Lookup]
  // ======================

  /**
   * The root command of definition of this application.
   *
   * A root command is represent to execute with no actual command,
   * for example, 'my-cli' will be resolve as root command if specified.
   */
  readonly rootCommand?: Command

  /**
   * The command definition list of this application.
   */
  readonly commands?: Command | Command[]

  // ======================
  // [Misc]
  // ======================

  /**
   * Set parser option manually to change default parser behaviors.
   */
  readonly parserOptions?: Pick<ParserOption, 'resolveAlias' | 'resolveFlagAfterArgument' | 'resolveUnknown'>

  /**
   * Development-only options for debugging or diagnostics.
   *
   * @private
   */
  readonly __dev__?: {
    /**
     * Enables verbose logging for debugging.
     *
     * If `true`, additional information about parsing decisions
     * and intermediate states may be output.
     *
     * @default false
     * @private
     */
    readonly verbose?: boolean
  }
}

export type AppRunner = (argv?: string[]) => Promise<void>

export interface App {
  /**
   * The config option of a Vertin application.
   */
  readonly option: AppOption

  /**
   * The main run function to resolve command and parameters.
   *
   * You can pass the argv array manually, if no specified,
   * Vertin will automatically read it from your runtime.
   */
  readonly run: AppRunner
}
