import Parser from 'web-tree-sitter';
import { KeyAttributes, PhysicalLayout, PositionMap, PositionMapItem } from '../types';
import { chunks } from '../utility';
import {
    findBySameNode,
    findCompatible,
    getChildNodes,
    getNodeLabel,
    getNodePath,
    getPropertyValue,
    ParseError,
    parseNumber,
    parsePhandle,
} from './devicetree';

export interface LayoutParseResult {
    layouts: PhysicalLayout[];
    positionMap?: PositionMap;
}

export function parseLayouts(parser: Parser, text: string): LayoutParseResult {
    const tree = parser.parse(text);
    const root = tree.rootNode;

    const layouts = findCompatible(root, 'zmk,physical-layout');
    const positionMaps = findCompatible(root, 'zmk,physical-layout-position-map');

    return {
        layouts: layouts.map((n) => parsePhysicalLayout(root, n)),
        positionMap: positionMaps[0] && parsePositionMap(positionMaps[0]),
    };
}

function parsePhysicalLayout(root: Parser.SyntaxNode, node: Parser.SyntaxNode): PhysicalLayout {
    const nodes = findBySameNode(root, node);

    const displayName = getPropertyValue(nodes, 'display-name', 'string') ?? '';
    const keys = getPropertyValue(nodes, 'keys', 'phandle-array') ?? [];
    const transform = getPropertyValue(nodes, 'transform', 'phandle') ?? '';
    const kscan = getPropertyValue(nodes, 'kscan', 'phandle') ?? '';

    return {
        path: getNodePath(node),
        label: getNodeLabel(node),
        displayName,
        keys: parseKeyAttributesArray(keys),
        transform,
        kscan,
    };
}

const KEY_ATTRS_SIZE = 8;

function parseKeyAttributesArray(keys: Parser.SyntaxNode[]) {
    const result: KeyAttributes[] = [];

    for (const chunk of chunks(keys, KEY_ATTRS_SIZE)) {
        if (chunk.length !== KEY_ATTRS_SIZE) {
            throw new ParseError(chunk[chunk.length - 1], 'Expected &key_physical_attrs followed by 7 numbers');
        }

        const [phandle, width, height, x, y, rot, rx, ry] = chunk;

        if (parsePhandle(phandle) !== 'key_physical_attrs') {
            throw new ParseError(phandle, 'Expected &key_physical_attrs');
        }

        result.push({
            position: [parseNumber(x) / 100, parseNumber(y) / 100],
            width: parseNumber(width) / 100,
            height: parseNumber(height) / 100,
            rotation: parseNumber(rot) / 100,
            origin: [parseNumber(rx) / 100, parseNumber(ry) / 100],
        });
    }

    return result;
}

function parsePositionMap(map: Parser.SyntaxNode): PositionMap {
    const complete = getPropertyValue(map, 'complete', 'bool');
    const children = getChildNodes(map);

    return {
        path: getNodePath(map),
        label: getNodeLabel(map),
        complete,
        children: children.map(parsePositionMapItem),
    };
}

function parsePositionMapItem(item: Parser.SyntaxNode): PositionMapItem {
    return {
        path: getNodePath(item),
        label: getNodeLabel(item),
        physicalLayout: getPropertyValue(item, 'physical-layout', 'phandle') || '',
        positions: getPropertyValue(item, 'positions', 'array') ?? [],
    };
}
