import type { CommandOption, RootCommandOption } from '@/types/command'
import { describe, expect, it, vi } from 'vitest'
import { defineApp, defineCommand, defineRootCommand } from '@/helper'

describe('defineCommand', () => {
  it('should create a command with basic metadata', () => {
    const mockHandler = vi.fn()
    const commandOption: CommandOption = {
      name: 'test',
      description: 'Test command',
      version: '1.0.0',
      arguments: {},
      flags: {},
    }

    const command = defineCommand(commandOption, mockHandler)

    expect(command.metadata).toEqual({
      name: 'test',
      description: 'Test command',
      version: '1.0.0',
    })
    expect(command.exec).toEqual({
      name: 'test',
      arguments: {},
      flags: {},
    })
    expect(command.handler).toBe(mockHandler)
    expect(command.subCommands).toBeUndefined()
  })

  it('should create a command with custom exec name', () => {
    const mockHandler = vi.fn()
    const commandOption: CommandOption = {
      name: 'test',
      execName: 'custom-test',
      description: 'Test command',
      arguments: {},
      flags: {},
    }

    const command = defineCommand(commandOption, mockHandler)

    expect(command.exec.name).toBe('custom-test')
  })

  it('should create a command with arguments and flags', () => {
    const mockHandler = vi.fn()
    const commandOption: CommandOption = {
      name: 'test',
      description: 'Test command',
      arguments: {
        input: { resolver: String, required: true },
        count: { resolver: Number, default: 1 },
      },
      flags: {
        verbose: { resolver: Boolean, default: false },
        config: { resolver: String, alias: 'c' },
      },
    }

    const command = defineCommand(commandOption, mockHandler)

    expect(command.exec.arguments).toEqual({
      input: { resolver: String, required: true },
      count: { resolver: Number, default: 1 },
    })
    expect(command.exec.flags).toEqual({
      verbose: { resolver: Boolean, default: false },
      config: { resolver: String, alias: 'c' },
    })
  })

  it('should create a command with subcommands', () => {
    const mockHandler = vi.fn()
    const subCommand = defineCommand({
      name: 'sub',
      description: 'Sub command',
      arguments: {},
      flags: {},
    }, vi.fn())

    const commandOption: CommandOption = {
      name: 'test',
      description: 'Test command',
      arguments: {},
      flags: {},
      subCommands: [subCommand],
    }

    const command = defineCommand(commandOption, mockHandler)

    expect(command.subCommands).toEqual([subCommand])
  })

  it('should handle optional arguments and flags', () => {
    const mockHandler = vi.fn()
    const commandOption: CommandOption = {
      name: 'test',
      description: 'Test command',
    }

    const command = defineCommand(commandOption, mockHandler)

    expect(command.exec.arguments).toEqual({})
    expect(command.exec.flags).toEqual({})
  })
})

describe('defineRootCommand', () => {
  it('should create a root command with basic configuration', () => {
    const mockHandler = vi.fn()
    const rootCommandOption: RootCommandOption = {
      description: 'Root command description',
      arguments: {},
      flags: {},
    }

    const command = defineRootCommand(rootCommandOption, mockHandler)

    expect(command.metadata).toEqual({
      name: '__root__',
      description: '__root_description__',
    })
    expect(command.exec).toEqual({
      name: '__root__',
      arguments: {},
      flags: {},
    })
    expect(command.handler).toBe(mockHandler)
    expect(command.subCommands).toBeUndefined()
  })

  it('should create a root command with arguments and flags', () => {
    const mockHandler = vi.fn()
    const rootCommandOption: RootCommandOption = {
      description: 'Root command description',
      arguments: {
        input: { resolver: String, required: true },
      },
      flags: {
        verbose: { resolver: Boolean, default: false },
      },
    }

    const command = defineRootCommand(rootCommandOption, mockHandler)

    expect(command.exec.arguments).toEqual({
      input: { resolver: String, required: true },
    })
    expect(command.exec.flags).toEqual({
      verbose: { resolver: Boolean, default: false },
    })
  })

  it('should handle optional arguments and flags', () => {
    const mockHandler = vi.fn()
    const rootCommandOption: RootCommandOption = {
      description: 'Root command description',
    }

    const command = defineRootCommand(rootCommandOption, mockHandler)

    expect(command.exec.arguments).toEqual({})
    expect(command.exec.flags).toEqual({})
  })
})

describe('defineApp', () => {
  it('should create an app with basic configuration', () => {
    const mockHandler = vi.fn()
    const command = defineCommand({
      name: 'test',
      description: 'Test command',
      arguments: {},
      flags: {},
    }, mockHandler)

    const appOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [command],
    }

    const app = defineApp(appOption)

    expect(app.option).toEqual(appOption)
    expect(typeof app.run).toBe('function')
  })

  it('should create an app with root command', () => {
    const mockHandler = vi.fn()
    const rootCommand = defineRootCommand({
      description: 'Root command description',
      arguments: {},
      flags: {},
    }, mockHandler)

    const appOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      rootCommand,
    }

    const app = defineApp(appOption)

    expect(app.option).toEqual(appOption)
    expect(typeof app.run).toBe('function')
  })

  it('should create an app with both commands and root command', () => {
    const mockHandler = vi.fn()
    const command = defineCommand({
      name: 'test',
      description: 'Test command',
      arguments: {},
      flags: {},
    }, mockHandler)

    const rootCommand = defineRootCommand({
      description: 'Root command description',
      arguments: {},
      flags: {},
    }, mockHandler)

    const appOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [command],
      rootCommand,
    }

    const app = defineApp(appOption)

    expect(app.option).toEqual(appOption)
    expect(typeof app.run).toBe('function')
  })

  it('should create an app with parser options', () => {
    const mockHandler = vi.fn()
    const command = defineCommand({
      name: 'test',
      description: 'Test command',
      arguments: {},
      flags: {},
    }, mockHandler)

    const appOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [command],
      parserOptions: {
        resolveAlias: false,
        resolveUnknown: 'block' as const,
        resolveFlagAfterArgument: false,
      },
    }

    const app = defineApp(appOption)

    expect(app.option).toEqual(appOption)
    expect(typeof app.run).toBe('function')
  })
})
