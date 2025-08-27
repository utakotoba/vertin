import type { Command } from '@/types/command'
import { describe, expect, it } from 'vitest'
import { DFSMatch, matchCommands } from '@/matcher'

describe('dFSMatch', () => {
  it('should return undefined when index exceeds argv length', () => {
    const commands: Command[] = []
    const argv = ['node', 'script.js', 'test']
    const result = DFSMatch(argv, commands, 3, [])

    expect(result.command).toBeUndefined()
    expect(result.remainingArgs).toEqual([])
    expect(result.matchedPath).toEqual([])
  })

  it('should find exact command match', () => {
    const mockHandler = () => Promise.resolve()
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

    const commands = [command]
    const argv = ['node', 'script.js', 'test', 'arg1', 'arg2']
    const result = DFSMatch(argv, commands, 2, [])

    expect(result.command).toBe(command)
    expect(result.remainingArgs).toEqual(['arg1', 'arg2'])
    expect(result.matchedPath).toEqual(['test'])
  })

  it('should continue searching in subcommands', () => {
    const mockHandler = () => Promise.resolve()
    const subCommand: Command = {
      metadata: {
        name: 'sub',
        description: 'Sub command',
      },
      exec: {
        name: 'sub',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

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
      subCommands: [subCommand],
    }

    const commands = [command]
    const argv = ['node', 'script.js', 'test', 'sub', 'arg1']
    const result = DFSMatch(argv, commands, 2, [])

    expect(result.command).toBe(subCommand)
    expect(result.remainingArgs).toEqual(['arg1'])
    expect(result.matchedPath).toEqual(['test', 'sub'])
  })

  it('should return parent command when no subcommand matches', () => {
    const mockHandler = () => Promise.resolve()
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
      subCommands: [],
    }

    const commands = [command]
    const argv = ['node', 'script.js', 'test', 'unknown', 'arg1']
    const result = DFSMatch(argv, commands, 2, [])

    expect(result.command).toBe(command)
    expect(result.remainingArgs).toEqual(['unknown', 'arg1'])
    expect(result.matchedPath).toEqual(['test'])
  })

  it('should return undefined when no command matches', () => {
    const mockHandler = () => Promise.resolve()
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

    const commands = [command]
    const argv = ['node', 'script.js', 'unknown', 'arg1']
    const result = DFSMatch(argv, commands, 2, [])

    expect(result.command).toBeUndefined()
    expect(result.remainingArgs).toEqual(['unknown', 'arg1'])
    expect(result.matchedPath).toEqual([])
  })

  it('should build path correctly for nested commands', () => {
    const mockHandler = () => Promise.resolve()
    const subSubCommand: Command = {
      metadata: {
        name: 'subsub',
        description: 'Sub sub command',
      },
      exec: {
        name: 'subsub',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const subCommand: Command = {
      metadata: {
        name: 'sub',
        description: 'Sub command',
      },
      exec: {
        name: 'sub',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
      subCommands: [subSubCommand],
    }

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
      subCommands: [subCommand],
    }

    const commands = [command]
    const argv = ['node', 'script.js', 'test', 'sub', 'subsub', 'arg1']
    const result = DFSMatch(argv, commands, 2, [])

    expect(result.command).toBe(subSubCommand)
    expect(result.remainingArgs).toEqual(['arg1'])
    expect(result.matchedPath).toEqual(['test', 'sub', 'subsub'])
  })
})

describe('matchCommands', () => {
  it('should throw error when no commands available', () => {
    const argv = ['node', 'script.js', 'test']

    expect(() => matchCommands(argv, [], undefined, 2)).toThrow('No commands available for matching')
  })

  it('should return root command when no top-level commands', () => {
    const mockHandler = () => Promise.resolve()
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

    const argv = ['node', 'script.js', 'arg1', 'arg2']
    const result = matchCommands(argv, [], rootCommand, 2)

    expect(result.command).toBe(rootCommand)
    expect(result.remainingArgs).toEqual(['arg1', 'arg2'])
    expect(result.matchedPath).toEqual([])
  })

  it('should match top-level command', () => {
    const mockHandler = () => Promise.resolve()
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

    const argv = ['node', 'script.js', 'test', 'arg1']
    const result = matchCommands(argv, [command], undefined, 2)

    expect(result.command).toBe(command)
    expect(result.remainingArgs).toEqual(['arg1'])
    expect(result.matchedPath).toEqual(['test'])
  })

  it('should return root command when no top-level command matches', () => {
    const mockHandler = () => Promise.resolve()
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

    const argv = ['node', 'script.js', 'unknown', 'arg1']
    const result = matchCommands(argv, [command], rootCommand, 2)

    expect(result.command).toBe(rootCommand)
    expect(result.remainingArgs).toEqual(['unknown', 'arg1'])
    expect(result.matchedPath).toEqual([])
  })

  it('should handle single command in commands array', () => {
    const mockHandler = () => Promise.resolve()
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

    const argv = ['node', 'script.js', 'test', 'arg1']
    const result = matchCommands(argv, [command], undefined, 2)

    expect(result.command).toBe(command)
    expect(result.remainingArgs).toEqual(['arg1'])
    expect(result.matchedPath).toEqual(['test'])
  })

  it('should handle custom start index', () => {
    const mockHandler = () => Promise.resolve()
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

    const argv = ['custom', 'prefix', 'test', 'arg1']
    const result = matchCommands(argv, [command], undefined, 2)

    expect(result.command).toBe(command)
    expect(result.remainingArgs).toEqual(['arg1'])
    expect(result.matchedPath).toEqual(['test'])
  })
})
