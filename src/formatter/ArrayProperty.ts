import { chunks, dtnum } from '../utility';
import { Formattable, getIndent } from './Formattable';

function formatRow(row: number[], digits: number) {
    return `<${row.map((x) => dtnum(x, digits)).join(' ')}>`;
}

/**
 * Devicetree number array property.
 *
 * If numColumns = 0, outputs
 * ```
 * name = <1 2 3 4 5 6 7 8 9 10 11 12>;
 * ```
 *
 * Else outputs aligned columns, e.g. for numColumns = 4
 * ```
 * name
 *     = < 1  2  3  4>
 *     , < 5  6  7  8>
 *     , < 9 10 11 12>
 *     ;
 * ```
 */
export class ArrayProperty implements Formattable {
    constructor(
        public name: string,
        public values: number[],
        public numColumns = 0,
    ) {}

    toString(indentSize?: number): string {
        const prefix = getIndent(indentSize);

        const digits = this.numColumns ? maxDigits(this.values) : 0;

        if (this.values.length <= this.numColumns) {
            return `${this.name} = ${formatRow(this.values, digits)};`;
        }

        const rows = chunks(this.values, this.numColumns);

        return (
            this.name +
            `\n${prefix}= ` +
            rows.map((row) => formatRow(row, digits)).join(`\n${prefix}, `) +
            `\n${prefix};`
        );
    }
}

function maxDigits(values: readonly number[]) {
    return Math.ceil(Math.log10(Math.max(...values)));
}
