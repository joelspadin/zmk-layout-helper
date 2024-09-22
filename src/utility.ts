export function maxValue<T>(
  items: readonly T[],
  callback: (item: T) => number,
  initial = 0
): number {
  return items.reduce((prev, item) => Math.max(prev, callback(item)), initial);
}
