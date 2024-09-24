export function maxValue<T>(items: readonly T[], callback: (item: T) => number, initial = 0): number {
    return items.reduce((prev, item) => Math.max(prev, callback(item)), initial);
}

export function dtnum(value: number, width = 0) {
    const text = value < 0 ? `(${value})` : value.toString();
    return width ? text.padStart(width) : text;
}

export function indent(text: string, level = 1, prefix = '    ') {
    prefix = prefix.repeat(level);

    return text
        .split('\n')
        .map((line) => (line ? prefix + line : line))
        .join('\n');
}

export function chunks<T>(items: readonly T[], chunkSize: number): T[][] {
    if (chunkSize <= 0) {
        return [[...items]];
    }

    const result = [];

    for (let i = 0; i < items.length; i += chunkSize) {
        result.push(items.slice(i, i + chunkSize));
    }

    return result;
}
