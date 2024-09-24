/**
 * Get the maximum value of the results of a callback on a list of items.
 */
export function maxValue<T>(items: readonly T[], callback: (item: T) => number, initial = 0): number {
    return items.reduce((prev, item) => Math.max(prev, callback(item)), initial);
}

/**
 * Format a number for devicetree output.
 */
export function dtnum(value: number, width = 0) {
    const text = value < 0 ? `(${value})` : value.toString();
    return width ? text.padStart(width) : text;
}

/**
 * Indent all the lines in a string by the given amount.
 */
export function indent(text: string, level = 1, prefix = '    ') {
    prefix = prefix.repeat(level);

    return text
        .split('\n')
        .map((line) => (line ? prefix + line : line))
        .join('\n');
}

/**
 * Split a list into chunks of the given size.
 *
 * If the remainder of the list is not large enough to fill a complete chunk,
 * the last item in the result may have fewer items.
 */
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
