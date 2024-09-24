import { indent } from '../utility';
import { Formattable, getIndent } from './Formattable';
import { Spacer } from './Spacer';

/**
 * Devicetree node.
 */
export class Node implements Formattable {
    private children: Formattable[] = [];

    constructor(
        public name: string,
        public label = '',
    ) {}

    toString(indentSize?: number): string {
        let identifier = this.name;
        if (this.label) {
            identifier = this.label + ': ' + identifier;
        }

        const contents = this.children.map((c) => c.toString(indentSize)).join('\n');

        return `\
${identifier} {
${indent(contents, 1, getIndent(indentSize))}
};`;
    }

    /**
     * Find the child node with the given name.
     */
    findChild(name: string): Node | undefined {
        return this.children.filter((c) => c instanceof Node).find((c) => c.name === name);
    }

    /**
     * Add a formattable object to the body of the node.
     */
    addChild(child: Formattable) {
        // For better readability, insert a blank line before any new node
        // except for the first child.
        if (child instanceof Node && this.children.length > 0) {
            this.addSpacer();
        }

        this.children.push(child);
    }

    /**
     * Add a blank line.
     */
    addSpacer() {
        this.children.push(new Spacer());
    }
}
