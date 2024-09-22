export function maxValue<T>(
  items: readonly T[],
  callback: (item: T) => number,
  initial = 0
): number {
  return items.reduce((prev, item) => Math.max(prev, callback(item)), initial);
}

export function lpad(value: string | number, width: number, pad = " ") {
  const text = value.toString();

  if (text.length >= width) {
    return value;
  }

  return pad.repeat(width - text.length) + value;
}
