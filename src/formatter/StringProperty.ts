import { Formattable } from './Formattable';

/**
 * Devicetree string property.
 *
 * Outputs
 * ```
 * name = "value";
 * ```
 */
export class StringProperty implements Formattable {
    constructor(
        public name: string,
        public value: string,
    ) {}

    toString(): string {
        return `${this.name} = "${this.value}";`;
    }
}
