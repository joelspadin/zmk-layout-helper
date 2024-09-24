import { Formattable } from './Formattable';

export class PhandleProperty implements Formattable {
    constructor(
        public name: string,
        public label: string,
    ) {}

    toString(): string {
        return `${this.name} = <&${this.label}>;`;
    }
}
