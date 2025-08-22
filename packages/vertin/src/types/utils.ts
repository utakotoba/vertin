/**
 * A utility type that sets specific properties of an object to `any`.
 *
 * Use this to temporarily disable type-checking for certain keys
 * This should be used with caution as it removes type safety.
 *
 * @template T The object type.
 * @template K The keys of `T` to set as `any`.
 */
export type _AnyProps<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? any : T[P]
}
