/**
 * checks if a string is not empty
 */
export function isNotEmpty(payload?: string): boolean {
  return typeof payload === 'string' && payload.trim().length > 0
}
