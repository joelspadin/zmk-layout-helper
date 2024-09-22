import { SyntaxNode } from "web-tree-sitter";

export class Position {
  constructor(
    public line: number,
    public column: number
  ) {}

  toString(): string {
    return `${this.line}:${this.column}`;
  }
}

export class Range {
  constructor(
    public start: Position,
    public end: Position
  ) {}

  toString(): string {
    if (this.start.line === this.end.line) {
      if (this.start.column === this.end.column - 1) {
        return this.start.toString();
      }

      return `${this.start.line}:${this.start.column}-${this.end.column}`;
    }

    return `${this.start}-${this.end}`;
  }
}

export function getNodeRange(text: string, node: SyntaxNode): Range {
  return getNodeRanges(text, [node])[0];
}

export function getNodeRanges(text: string, nodes: SyntaxNode[]): Range[] {
  const lineBreaks = getLineBreakIndices(text);

  return nodes.map((n) => {
    const start = indexToPosition(n.startIndex, lineBreaks);
    const end = indexToPosition(n.endIndex, lineBreaks);

    return new Range(start, end);
  });
}

function getLineBreakIndices(text: string) {
  const breaks: number[] = [];
  let index = 0;

  while ((index = text.indexOf("\n", index)) >= 0) {
    breaks.push(index);
    index++;
  }

  return breaks;
}

function indexToPosition(index: number, lineBreaks: number[]): Position {
  if (index >= lineBreaks[lineBreaks.length - 1]) {
    return new Position(lineBreaks.length, 0);
  }

  const line = lineBreaks.findIndex((lineBreak) => index < lineBreak);
  if (line < 0) {
    return new Position(0, 0);
  }

  const lineStart = line > 0 ? lineBreaks[line - 1] : 0;

  return new Position(line, index - lineStart);
}
