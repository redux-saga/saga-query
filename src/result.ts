import type { Result } from './types';

export function Ok<T>(value: T): Result<T> {
  return {
    ok: true,
    value,
  };
}
export function Err(error: { name: string; message: string }): Result {
  return {
    ok: false,
    error,
  };
}
