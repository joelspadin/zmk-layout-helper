import { Node } from './Node';

/**
 * Helper for building a representation of devicetree data.
 */
export class Tree {
    public root: Node = new Node('/');

    addNode(path: string, label = ''): Node {
        let result = this.root;
        let parts = path.split('/').slice(1);

        while (parts.length > 0) {
            const name = parts[0];

            const node = result.findChild(name);
            if (node) {
                result = node;
            } else {
                const child = new Node(name);
                result.addChild(child);
                result = child;
            }

            parts = parts.slice(1);
        }

        if (label) {
            result.label = label;
        }

        return result;
    }
}
