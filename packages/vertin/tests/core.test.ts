import type { AppOption } from '@/types/app'
import type { Command } from '@/types/command'
import { describe, expect, it, vi } from 'vitest'
import { createRuntime } from '@/core'

// mock the process.argv to avoid side effects
vi.mock('node:process', () => ({
  argv: ['node', 'script.js', 'test-command'],
}))

describe('createRuntime', () => {
  it('should create runtime with valid app option', () => {
    const mockHandler = vi.fn()
    const command: Command = {
      metadata: {
        name: 'test',
        description: 'Test command',
      },
      exec: {
        name: 'test',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [command],
    }

    const runtime = createRuntime(appOption)
    expect(typeof runtime).toBe('function')
  })

  it('should handle single command in commands array', () => {
    const mockHandler = vi.fn()
    const command: Command = {
      metadata: {
        name: 'test',
        description: 'Test command',
      },
      exec: {
        name: 'test',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: command, // single command, not array
    }

    const runtime = createRuntime(appOption)
    expect(typeof runtime).toBe('function')
  })

  it('should handle empty commands array', () => {
    const mockHandler = vi.fn()
    const rootCommand: Command = {
      metadata: {
        name: '__root__',
        description: 'Root command',
      },
      exec: {
        name: '__root__',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [],
      rootCommand,
    }

    const runtime = createRuntime(appOption)
    expect(typeof runtime).toBe('function')
  })

  it('should execute command with custom argv', async () => {
    const mockHandler = vi.fn()
    const command: Command = {
      metadata: {
        name: 'test',
        description: 'Test command',
      },
      exec: {
        name: 'test',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [command],
    }

    const runtime = createRuntime(appOption)
    const customArgv = ['node', 'script.js', 'test']

    await runtime(customArgv)

    expect(mockHandler).toHaveBeenCalledWith({
      arguments: {},
      flags: {},
      __unknownArguments__: [],
      __unknownFlags__: {},
    })
  })

  it('should execute root command when no subcommand matches', async () => {
    const mockHandler = vi.fn()
    const rootCommand: Command = {
      metadata: {
        name: '__root__',
        description: 'Root command',
      },
      exec: {
        name: '__root__',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [],
      rootCommand,
    }

    const runtime = createRuntime(appOption)
    const customArgv = ['node', 'script.js', 'unknown-command']

    await runtime(customArgv)

    expect(mockHandler).toHaveBeenCalledWith({
      arguments: {},
      flags: {},
      __unknownArguments__: [],
      __unknownFlags__: {},
    })
  })

  it('should throw error when no command found and no root command', () => {
    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [],
    }

    expect(() => createRuntime(appOption)).toThrow('App option `commands` array cannot be empty')
  })

  it('should throw error when command not found and no root command', async () => {
    const mockHandler = vi.fn()
    const command: Command = {
      metadata: {
        name: 'test',
        description: 'Test command',
      },
      exec: {
        name: 'test',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [command],
    }

    const runtime = createRuntime(appOption)
    const customArgv = ['node', 'script.js', 'unknown-command']

    await expect(runtime(customArgv)).rejects.toThrow('No command found')
  })

  it('should handle command with arguments and flags', async () => {
    const mockHandler = vi.fn()
    const command: Command = {
      metadata: {
        name: 'test',
        description: 'Test command',
      },
      exec: {
        name: 'test',
        arguments: {
          input: { resolver: String },
        },
        flags: {
          verbose: { resolver: Boolean },
        },
      },
      handler: mockHandler,
    }

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [command],
    }

    const runtime = createRuntime(appOption)
    const customArgv = ['node', 'script.js', 'test', '--verbose', 'input.txt']

    await runtime(customArgv)

    expect(mockHandler).toHaveBeenCalledWith({
      arguments: {
        input: 'input.txt',
      },
      flags: {
        verbose: true,
      },
      __unknownArguments__: [],
      __unknownFlags__: {},
    })
  })

  it('should merge parser options correctly', async () => {
    const mockHandler = vi.fn()
    const command: Command = {
      metadata: {
        name: 'test',
        description: 'Test command',
      },
      exec: {
        name: 'test',
        arguments: {},
        flags: {
          verbose: { resolver: Boolean, alias: 'v' },
        },
      },
      handler: mockHandler,
    }

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [command],
      parserOptions: {
        resolveAlias: false,
        resolveUnknown: 'block',
      },
    }

    const runtime = createRuntime(appOption)
    const customArgv = ['node', 'script.js', 'test', '-v']

    await expect(runtime(customArgv)).rejects.toThrow('Unknown flag: -v')
  })
})
