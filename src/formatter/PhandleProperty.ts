import { Formattable } from './Formattable';

/**
 * Devicetree phandle property.
 *
 * Outputs
 * ```
 * name = <&label>;
 * ```
 */
export class PhandleProperty implements Formattable {
    constructor(
        public name: string,
        public label: string,
    ) {}

    toString(): string {
        return `${this.name} = <&${this.label}>;`;
    }
}
