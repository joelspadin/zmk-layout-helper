import { Formattable } from './Formattable';

/**
 * Devicetree boolean property
 */
export class BooleanProperty implements Formattable {
    constructor(public name: string) {}

    toString(): string {
        return this.name + ';';
    }
}
