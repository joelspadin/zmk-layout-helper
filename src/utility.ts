export function maxValue<T>(items: readonly T[], callback: (item: T) => number, initial = 0): number {
    return items.reduce((prev, item) => Math.max(prev, callback(item)), initial);
}

export function dtnum(value: number) {
    return value < 0 ? `(${value})` : value;
}

export function indent(text: string, level = 1, prefix = '    ') {
    prefix = prefix.repeat(level);

    return text
        .split('\n')
        .map((line) => (line ? prefix + line : line))
        .join('\n');
}

export function lpad(value: string | number, width: number, pad = ' ') {
    const text = value.toString();

    if (text.length >= width) {
        return value;
    }

    return pad.repeat(width - text.length) + value;
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
