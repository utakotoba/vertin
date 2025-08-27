import type { AppOption, AppRunner } from './types/app'

export function createRuntime(
  _option: AppOption,
): AppRunner {
  return async (_argv?: string[]) => {}
}
