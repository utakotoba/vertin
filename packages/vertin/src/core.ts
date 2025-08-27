import type { AppOption, AppRunner } from './types/app'
import { validateAppOption } from './validator'

export function createRuntime(
  option: AppOption,
): AppRunner {
  validateAppOption(option)

  return async (_argv?: string[]) => {}
}
