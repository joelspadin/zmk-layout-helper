import Parser from 'web-tree-sitter';
import treeSitterUrl from 'web-tree-sitter/tree-sitter.wasm?url';

export let Devicetree: Parser.Language;

async function initParser(): Promise<void> {
    await Parser.init({
        locateFile(name: string, path: string) {
            if (name === 'tree-sitter.wasm') {
                return treeSitterUrl;
            }
            return path + name;
        },
    });

    Devicetree = await Parser.Language.load('tree-sitter-devicetree.wasm');
}

export async function getParser(): Promise<Parser> {
    if (!Devicetree) {
        await initParser();
    }

    const parser = new Parser();
    parser.setLanguage(Devicetree);
    return parser;
}

/**
 * Indicates a failure to parse part of the code, and where the error occurred.
 */
export class ParseError extends Error {
    constructor(
        public node: Parser.SyntaxNode,
        message: string,
    ) {
        super(message);
    }
}

export function getCapture(captures: Parser.QueryCapture[], name: string): Parser.SyntaxNode | null {
    return captures.find((c) => c.name === name)?.node ?? null;
}

export function getMatchCaptures(matches: Parser.QueryMatch[], name: string): Parser.SyntaxNode[] {
    return matches.map(({ captures }) => getCapture(captures, name)).filter((c) => c !== null);
}

/**
 * Find devicetree nodes with the given "compatible" property.
 */
export function findCompatible(root: Parser.SyntaxNode, compatible: string): Parser.SyntaxNode[] {
    const query = Devicetree.query(`
    (property
      name: (identifier) @name (#eq? @name "compatible")
      value: (string_literal) @value (#eq? @value "\\"${compatible}\\"")
    ) @prop`);

    const matches = query.matches(root);
    const props = getMatchCaptures(matches, 'prop');

    return props.map((n) => getContainingNode(n)).filter((n) => n !== null);
}

/**
 * Find devicetree nodes with the given path.
 */
export function findByPath(root: Parser.SyntaxNode, path: string): Parser.SyntaxNode[] {
    if (!path) {
        return [];
    }

    const query = Devicetree.query('(node) @node');
    const matches = query.matches(root);

    const nodes = getMatchCaptures(matches, 'node');

    return nodes.filter((n) => getNodePath(n) === path);
}

/**
 * Find devicetree nodes which reference the given label.
 */
export function findByReference(root: Parser.SyntaxNode, label: string): Parser.SyntaxNode[] {
    if (!label) {
        return [];
    }

    const query = Devicetree.query(`
    (node
      name: (reference
        label: (identifier) @label (#eq? @label "${label}")
      )
    ) @node`);
    const matches = query.matches(root);

    return getMatchCaptures(matches, 'node');
}

/**
 * Find devicetree nodes that modify the same node in tree, listed in the order
 * they appear in the file. The input node is included in the result.
 */
export function findBySameNode(root: Parser.SyntaxNode, node: Parser.SyntaxNode) {
    const path = getNodePath(node);
    const label = getNodeLabel(node);

    return [...findByPath(root, path), ...findByReference(root, label)].sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Get the devicetree node that contains the given syntax node.
 */
export function getContainingNode(node: Parser.SyntaxNode | null): Parser.SyntaxNode | null {
    while (node && node.type !== 'node') {
        node = node.parent;
    }
    return node;
}

/**
 * Get the child nodes of a devicetree node.
 */
export function getChildNodes(node: Parser.SyntaxNode): Parser.SyntaxNode[] {
    return node.namedChildren.filter((n) => n.type === 'node');
}

/**
 * Get a devicetree node's name.
 */
export function getNodeName(node: Parser.SyntaxNode | null): string {
    return node?.childForFieldName('name')?.text ?? '';
}

/**
 * Get a devicetree node's label, or an empty string if there is no label.
 */
export function getNodeLabel(node: Parser.SyntaxNode | null): string {
    return node?.childForFieldName('label')?.text ?? '';
}

/**
 * Get a devicetree node's full path.
 */
export function getNodePath(node: Parser.SyntaxNode | null): string {
    const parts = getNodePathParts(node);

    if (parts.length === 0) {
        return '';
    }

    if (parts.length === 1) {
        return parts[0];
    }

    const path = parts.join('/');

    // The top-level node should be named "/", which is a special case since the
    // path should not start with "//".
    return parts[0] === '/' ? path.substring(1) : path;
}

function getNodePathParts(node: Parser.SyntaxNode | null): string[] {
    // There may be intermediate syntax nodes between devicetree nodes, such as
    // #if blocks, so if we aren't currently on a "node" node, traverse up the
    // tree until we find one.
    const dtnode = getContainingNode(node);
    if (!dtnode) {
        return [];
    }

    return [...getNodePathParts(dtnode.parent), getNodeName(dtnode)];
}

/**
 * Get a devicetree node's property with the given name, or null if it doesn't
 * have the property.
 *
 * If there are multiple instances of the same property, this returns the last one.
 * This does not account for /delete-property/.
 */
export function getProperty(node: Parser.SyntaxNode | Parser.SyntaxNode[], name: string): Parser.SyntaxNode | null {
    if (Array.isArray(node)) {
        const props = node.map((n) => getProperty(n, name)).filter((n) => n !== null);
        return props.length ? props[props.length - 1] : null;
    }

    const query = Devicetree.query(`(property name: (identifier) @name (#eq? @name "${name}")) @prop`);
    const matches = query.matches(node);
    const props = getMatchCaptures(matches, 'prop');

    // The query finds all descendants. Filter to just the properties that belong
    // to the given devicetree node.
    const childProps = props.filter((prop) => getContainingNode(prop)?.equals(node));

    // Sort in descending order to select the last instance of the property.
    childProps.sort((a, b) => b.startIndex - a.startIndex);
    return childProps[0] ?? null;
}

export type ValueType = 'bool' | 'int' | 'string' | 'string-array' | 'array' | 'phandle' | 'phandles' | 'phandle-array';

/**
 * Get whether a boolean property is set on a devicetree node.
 */
export function getPropertyValue(node: Parser.SyntaxNode | Parser.SyntaxNode[], name: string, type: 'bool'): boolean;

/**
 * Get the value of a property holding a single number, or null if the property
 * is not set.
 */
export function getPropertyValue(
    node: Parser.SyntaxNode | Parser.SyntaxNode[],
    name: string,
    type: 'int',
): number | null;

/**
 * Get the value of a property holding a string or node reference, or null if
 * the property is not set.
 */
export function getPropertyValue(
    node: Parser.SyntaxNode | Parser.SyntaxNode[],
    name: string,
    type: 'string' | 'phandle',
): string | null;

/**
 * Get the value of a property holding a string array or node reference array,
 * or null if the property is not set.
 */
export function getPropertyValue(
    node: Parser.SyntaxNode | Parser.SyntaxNode[],
    name: string,
    type: 'string-array' | 'phandles',
): string[] | null;

/**
 * Get the value of a property holding an array of numbers, or null if the
 * property is not set.
 */
export function getPropertyValue(
    node: Parser.SyntaxNode | Parser.SyntaxNode[],
    name: string,
    type: 'array',
): number[] | null;

/**
 * Get the value of a property holding an array of node reference and/or numbers,
 * or null if the property is not set.
 */
export function getPropertyValue(
    node: Parser.SyntaxNode | Parser.SyntaxNode[],
    name: string,
    type: 'phandle-array',
): Parser.SyntaxNode[] | null;

export function getPropertyValue(
    node: Parser.SyntaxNode | Parser.SyntaxNode[],
    name: string,
    type: ValueType,
): boolean | number | number[] | string | string[] | Parser.SyntaxNode[] | null {
    const prop = getProperty(node, name);

    if (type === 'bool') {
        return !!prop;
    }

    if (!prop) {
        return null;
    }

    const value = prop?.childForFieldName('value');
    if (!value) {
        return null;
    }

    switch (type) {
        case 'int':
            return parseNumber(value);

        case 'string':
            return parseString(value);

        case 'phandle':
            return parsePhandle(value);

        case 'string-array':
            throw new Error('Not implemented');

        case 'phandles':
            throw new Error('Not implemented');

        case 'array':
            return parseArray(value);

        case 'phandle-array':
            return parsePhandleArray(value);
    }
}

function expectType(node: Parser.SyntaxNode, ...types: string[]) {
    if (!types.includes(node.type)) {
        throw new ParseError(node, `Expected ${types.join(' | ')} but got ${node.type}`);
    }
}

function getFirstCell(node: Parser.SyntaxNode) {
    let result = node.firstNamedChild;
    while (result?.type === 'comment') {
        result = result.nextNamedSibling;
    }
    if (!result) {
        throw new ParseError(node, 'Expected a value');
    }
    return result;
}

/**
 * Parse a node as a devicetree number. Expressions are evaluated, but this will
 * fail to parse any macros that haven't been expanded to numbers/expressions yet.
 */
export function parseNumber(node: Parser.SyntaxNode): number {
    expectType(node, 'integer_literal', 'unary_expression', 'binary_expression', 'integer_cells');

    switch (node.type) {
        case 'integer_cells':
            return parseNumber(getFirstCell(node));

        case 'unary_expression':
            return evaluateUnaryExpression(node);

        case 'binary_expression':
            return evaluateBinaryExpression(node);

        default:
            return Number(node.text);
    }
}

/**
 * Parse a node as a string literal.
 */
export function parseString(node: Parser.SyntaxNode): string {
    expectType(node, 'string_literal');

    const text = node.text.trim();
    return text.substring(1, text.length - 1);
}

/**
 * Parse a node as a node reference.
 */
export function parsePhandle(node: Parser.SyntaxNode): string {
    expectType(node, 'reference', 'integer_cells');

    if (node.type === 'integer_cells') {
        return parsePhandle(getFirstCell(node));
    }

    const label = node.childForFieldName('label');
    if (!label) {
        throw new ParseError(node, 'Expected a phandle');
    }

    return label.text;
}

/**
 * Parse a node as an array of numbers. Any sibling integer_cells nodes following
 * the given one are also included in the result.
 */
export function parseArray(node: Parser.SyntaxNode | null): number[] {
    const result: number[] = [];

    while (node) {
        if (node.type === 'integer_cells') {
            result.push(...node.namedChildren.map(parseNumber));
        }

        node = node.nextNamedSibling;
    }

    return result;
}

/**
 * Parse a node as an array of node references and/or numbers. Any sibling
 * integer_cells nodes following the given one are also included in the result.
 */
export function parsePhandleArray(node: Parser.SyntaxNode | null): Parser.SyntaxNode[] {
    const result: Parser.SyntaxNode[] = [];

    while (node) {
        if (node.type === 'integer_cells') {
            result.push(...node.namedChildren);
        }

        node = node.nextNamedSibling;
    }

    return result;
}

function evaluateUnaryExpression(node: Parser.SyntaxNode): number {
    const operator = node.childForFieldName('operator');
    const argument = node.childForFieldName('argument');

    if (!operator || !argument) {
        throw new ParseError(node, 'Invalid unary expression');
    }

    const value = parseNumber(argument);

    switch (operator.text) {
        case '!':
            return Number(!value);
        case '~':
            return ~value;
        case '-':
            return -value;
        case '+':
            return value;
        default:
            throw new ParseError(node, `Invalid operator "${operator.text}"`);
    }
}

function evaluateBinaryExpression(node: Parser.SyntaxNode): number {
    const operator = node.childForFieldName('operator');
    const left = node.childForFieldName('left');
    const right = node.childForFieldName('right');

    if (!operator || !left || !right) {
        throw new ParseError(node, 'Invalid binary expression');
    }

    const value1 = parseNumber(left);
    const value2 = parseNumber(right);

    switch (operator.text) {
        case '+':
            return value1 + value2;
        case '-':
            return value1 - value2;
        case '*':
            return value1 * value2;
        case '/':
            return value1 / value2;
        case '%':
            return value1 % value2;
        case '||':
            return Number(value1 || value2);
        case '&&':
            return Number(value1 && value2);
        case '|':
            return value1 | value2;
        case '^':
            return value1 ^ value2;
        case '&':
            return value1 & value2;
        case '==':
            return Number(value1 === value2);
        case '!=':
            return Number(value1 !== value2);
        case '>':
            return Number(value1 > value2);
        case '>=':
            return Number(value1 >= value2);
        case '<=':
            return Number(value1 <= value2);
        case '<':
            return Number(value1 < value2);
        case '<<':
            return value1 << value2;
        case '>>':
            return value1 >> value2;
        default:
            throw new ParseError(node, `Invalid operator "${operator.text}"`);
    }
}
