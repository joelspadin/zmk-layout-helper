import Parser from "web-tree-sitter";
import {
  KeyAttributes,
  PhysicalLayout,
  PositionMap,
  PositionMapItem,
} from "../types";
import {
  findBySameNode,
  findCompatible,
  getChildNodes,
  getNodeLabel,
  getNodeName,
  getPropertyValue,
  ParseError,
  parseNumber,
  parsePhandle,
} from "./devicetree";

export interface LayoutParseResult {
  layouts: PhysicalLayout[];
  positionMap?: PositionMap;
}

export function parseLayouts(parser: Parser, text: string): LayoutParseResult {
  const tree = parser.parse(text);
  const root = tree.rootNode;

  const layouts = findCompatible(root, "zmk,physical-layout");
  const positionMaps = findCompatible(root, "zmk,physical-layout-position-map");

  return {
    layouts: layouts.map((n) => parsePhysicalLayout(root, n)),
    positionMap: positionMaps[0] && parsePositionMap(positionMaps[0]),
  };
}

function parsePhysicalLayout(
  root: Parser.SyntaxNode,
  node: Parser.SyntaxNode
): PhysicalLayout {
  const nodes = findBySameNode(root, node);

  const displayName = getPropertyValue(nodes, "display-name", "string") ?? "";
  const keys = getPropertyValue(nodes, "keys", "phandle-array") ?? [];
  const transform = getPropertyValue(nodes, "transform", "phandle") ?? "";
  const kscan = getPropertyValue(nodes, "kscan", "phandle") ?? "";

  return {
    name: getNodeName(node),
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

  for (let i = 0; i < keys.length; i += KEY_ATTRS_SIZE) {
    const [phandle, width, height, x, y, rot, rx, ry] = keys.slice(
      i,
      i + KEY_ATTRS_SIZE
    );

    if (parsePhandle(phandle) !== "key_physical_attrs") {
      throw new ParseError(phandle, "Expected &key_physical_attrs");
    }

    result.push({
      width: parseNumber(width) / 100,
      height: parseNumber(height) / 100,
      x: parseNumber(x) / 100,
      y: parseNumber(y) / 100,
      rotation: parseNumber(rot) / 100,
      rx: parseNumber(rx) / 100,
      ry: parseNumber(ry) / 100,
    });
  }

  return result;
}

function parsePositionMap(map: Parser.SyntaxNode): PositionMap {
  const complete = getPropertyValue(map, "complete", "bool");
  const children = getChildNodes(map);

  return {
    name: getNodeName(map),
    label: getNodeLabel(map),
    complete,
    children: children.map(parsePositionMapItem),
  };
}

function parsePositionMapItem(item: Parser.SyntaxNode): PositionMapItem {
  return {
    name: getNodeName(item),
    label: getNodeLabel(item),
    physicalLayout: getPropertyValue(item, "physical-layout", "phandle") || "",
    positions: getPropertyValue(item, "positions", "array") ?? [],
  };
}
