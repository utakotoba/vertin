import type { AppOption } from '@/types/app'
import type { Command } from '@/types/command'
import { describe, expect, it } from 'vitest'
import { validateAppOption, validateCommands, validateRootCommand } from '@/validator'

describe('validateAppOption', () => {
  it('should throw if commands array is empty and rootCommand is not provided', () => {
    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [],
    }

    expect(() => validateAppOption(appOption)).toThrow('App option `commands` array cannot be empty')
  })

  it('should throw error for missing name', () => {
    const appOption = {
      description: 'Test application',
      version: '1.0.0',
      commands: [],
    } as unknown as AppOption // force cast to test runtime check

    expect(() => validateAppOption(appOption)).toThrow('App option must include non-empty `name` property')
  })

  it('should throw error for empty name', () => {
    const appOption: AppOption = {
      name: '',
      description: 'Test application',
      version: '1.0.0',
      commands: [],
    }

    expect(() => validateAppOption(appOption)).toThrow('App option must include non-empty `name` property')
  })

  it('should throw error for whitespace-only name', () => {
    const appOption: AppOption = {
      name: '   ',
      description: 'Test application',
      version: '1.0.0',
      commands: [],
    }

    expect(() => validateAppOption(appOption)).toThrow('App option must include non-empty `name` property')
  })

  it('should throw error for missing description', () => {
    const appOption = {
      name: 'test-app',
      version: '1.0.0',
      commands: [],
    } as unknown as AppOption // force cast to test runtime check

    expect(() => validateAppOption(appOption)).toThrow('App option must include non-empty `description` property')
  })

  it('should throw error for empty description', () => {
    const appOption: AppOption = {
      name: 'test-app',
      description: '',
      version: '1.0.0',
      commands: [],
    }

    expect(() => validateAppOption(appOption)).toThrow('App option must include non-empty `description` property')
  })

  it('should throw error for missing version', () => {
    const appOption = {
      name: 'test-app',
      description: 'Test application',
      commands: [],
    } as unknown as AppOption // force cast to test runtime check

    expect(() => validateAppOption(appOption)).toThrow('App option must include non-empty `version` property')
  })

  it('should throw error for empty version', () => {
    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '',
      commands: [],
    }

    expect(() => validateAppOption(appOption)).toThrow('App option must include non-empty `version` property')
  })

  it('should validate app with root command and no commands', () => {
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

    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      rootCommand,
    }

    expect(() => validateAppOption(appOption)).not.toThrow()
  })

  it('should throw error when neither rootCommand nor commands are provided', () => {
    const appOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
    } as AppOption

    expect(() => validateAppOption(appOption)).toThrow('App option must include either `rootCommand` or `commands` property')
  })

  it('should throw error for empty commands array', () => {
    const appOption: AppOption = {
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      commands: [],
    }

    expect(() => validateAppOption(appOption)).toThrow('App option `commands` array cannot be empty')
  })

  it('should validate app with both rootCommand and commands', () => {
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
      rootCommand,
    }

    expect(() => validateAppOption(appOption)).not.toThrow()
  })
})

describe('validateRootCommand', () => {
  it('should validate valid root command', () => {
    const mockHandler = () => Promise.resolve()
    const rootCommand: Command = {
      metadata: {
        name: '__root__',
        description: 'Root command description',
      },
      exec: {
        name: '__root__',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    expect(() => validateRootCommand(rootCommand)).not.toThrow()
  })

  it('should throw error for missing description', () => {
    const mockHandler = () => Promise.resolve()
    const rootCommand: Command = {
      metadata: {
        name: '__root__',
        description: '',
      },
      exec: {
        name: '__root__',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    expect(() => validateRootCommand(rootCommand)).toThrow('Root command must include non-empty `metadata.description` property')
  })

  it('should throw error for whitespace-only description', () => {
    const mockHandler = () => Promise.resolve()
    const rootCommand: Command = {
      metadata: {
        name: '__root__',
        description: '   ',
      },
      exec: {
        name: '__root__',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    expect(() => validateRootCommand(rootCommand)).toThrow('Root command must include non-empty `metadata.description` property')
  })

  it('should throw error for missing handler', () => {
    const rootCommand = {
      metadata: {
        name: '__root__',
        description: 'Root command description',
      },
      exec: {
        name: '__root__',
        arguments: {},
        flags: {},
      },
    } as Command

    expect(() => validateRootCommand(rootCommand)).toThrow('Root command must include a valid `handler` function')
  })

  it('should throw error for non-function handler', () => {
    const rootCommand: Command = {
      metadata: {
        name: '__root__',
        description: 'Root command description',
      },
      exec: {
        name: '__root__',
        arguments: {},
        flags: {},
      },
      handler: 'not-a-function' as any,
    }

    expect(() => validateRootCommand(rootCommand)).toThrow('Root command must include a valid `handler` function')
  })

  it('should throw error for root command with subcommands', () => {
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

    const rootCommand: Command = {
      metadata: {
        name: '__root__',
        description: 'Root command description',
      },
      exec: {
        name: '__root__',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
      subCommands: [subCommand],
    }

    expect(() => validateRootCommand(rootCommand)).toThrow('Root command should not contain subCommands')
  })
})

describe('validateCommands', () => {
  it('should validate valid commands array', () => {
    const mockHandler = () => Promise.resolve()
    const command1: Command = {
      metadata: {
        name: 'test1',
        description: 'Test command 1',
      },
      exec: {
        name: 'test1',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const command2: Command = {
      metadata: {
        name: 'test2',
        description: 'Test command 2',
      },
      exec: {
        name: 'test2',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    expect(() => validateCommands([command1, command2])).not.toThrow()
  })

  it('should throw error for duplicate exec names', () => {
    const mockHandler = () => Promise.resolve()
    const command1: Command = {
      metadata: {
        name: 'test1',
        description: 'Test command 1',
      },
      exec: {
        name: 'duplicate',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const command2: Command = {
      metadata: {
        name: 'test2',
        description: 'Test command 2',
      },
      exec: {
        name: 'duplicate',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    expect(() => validateCommands([command1, command2])).toThrow('Duplicate execName \'duplicate\' found in commands at the same level')
  })

  it('should validate commands with subcommands', () => {
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

    expect(() => validateCommands([command])).not.toThrow()
  })

  it('should throw error for command with missing name', () => {
    const mockHandler = () => Promise.resolve()
    const command = {
      metadata: {
        description: 'Test command',
      },
      exec: {
        name: 'test',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    } as unknown as Command // force cast to test runtime check

    expect(() => validateCommands([command])).toThrow('Command \'test\' must include non-empty \'metadata.name\' property')
  })

  it('should throw error for command with missing description', () => {
    const mockHandler = () => Promise.resolve()
    const command: Command = {
      metadata: {
        name: 'test',
        description: '',
      },
      exec: {
        name: 'test',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    expect(() => validateCommands([command])).toThrow('Command \'test\' must include non-empty \'metadata.description\' property')
  })

  it('should throw error for command with missing handler', () => {
    const command = {
      metadata: {
        name: 'test',
        description: 'Test command',
      },
      exec: {
        name: 'test',
        arguments: {},
        flags: {},
      },
    } as Command

    expect(() => validateCommands([command])).toThrow('Command \'test\' must include a valid \'handler\' function')
  })

  it('should throw error for command with non-function handler', () => {
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
      handler: 'not-a-function' as any,
    }

    expect(() => validateCommands([command])).toThrow('Command \'test\' must include a valid \'handler\' function')
  })

  it('should throw error for duplicate exec names in subcommands', () => {
    const mockHandler = () => Promise.resolve()
    const subCommand1: Command = {
      metadata: {
        name: 'sub1',
        description: 'Sub command 1',
      },
      exec: {
        name: 'duplicate',
        arguments: {},
        flags: {},
      },
      handler: mockHandler,
    }

    const subCommand2: Command = {
      metadata: {
        name: 'sub2',
        description: 'Sub command 2',
      },
      exec: {
        name: 'duplicate',
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
      subCommands: [subCommand1, subCommand2],
    }

    expect(() => validateCommands([command])).toThrow('Duplicate execName \'duplicate\' found in commands at the same level')
  })
})
