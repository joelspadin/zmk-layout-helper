import { Formattable } from './Formattable';

/**
 * Outputs a blank line.
 */
export class Spacer implements Formattable {
    toString(): string {
        return '';
    }
}
