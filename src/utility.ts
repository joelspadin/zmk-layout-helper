import { PhysicalLayout, PositionMap } from './types';

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
 * Capitalize the first letter of a string.
 */
export function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.substring(1);
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

export function getMinKeyCount(layouts: PhysicalLayout[], positionMap: PositionMap): number {
    const layoutKeyCount = maxValue(layouts, (item) => item.keys.length);
    const maxUsedKey = Math.max(
        0,
        ...positionMap.children.map((map) => map.positions.filter((p) => p !== undefined)).flat(),
    );

    return Math.max(layoutKeyCount, maxUsedKey + 1);
}
