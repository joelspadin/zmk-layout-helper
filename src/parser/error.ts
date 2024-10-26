import Parser from 'web-tree-sitter';

/**
 * Indicates a failure to parse part of the code and where the error occurred.
 */
export class ParseError extends Error {
    public startPosition: Parser.Point;
    public endPosition: Parser.Point;

    constructor(message: string, node: Parser.SyntaxNode);
    constructor(message: string, start: Parser.Point, end: Parser.Point);

    constructor(message: string, nodeOrStart: Parser.SyntaxNode | Parser.Point, end?: Parser.Point) {
        super(message);

        if (isPoint(nodeOrStart)) {
            if (!end) {
                throw new Error('Invalid value for "end"');
            }

            const start = nodeOrStart;
            this.startPosition = start;
            this.endPosition = end;
        } else {
            const node = nodeOrStart;
            this.startPosition = node.startPosition;
            this.endPosition = node.endPosition;
        }
    }
}

function isPoint(obj: unknown): obj is Parser.Point {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'row' in obj &&
        typeof obj.row === 'number' &&
        'column' in obj &&
        typeof obj.column === 'number'
    );
}
