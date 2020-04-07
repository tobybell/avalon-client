export function cap(x: string) {
  return x[0].toUpperCase() + x.substr(1);
}

/** Return a copy of a list, having removed a particular value. */
export function without<T>(array: T[], value: T): T[] {
  return array.filter(x => !Object.is(x, value));
}

export function repeat<T>(n: number, f: (i: number) => T): T[] {
  return Array(n).fill(null).map((_, i) => f(i));
}
