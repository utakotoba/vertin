export function isNotEmpty(payload?: string): boolean {
  return typeof payload === 'string' && payload.trim().length > 0
}
