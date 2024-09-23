export interface Formattable {
  toString(indentSize?: number): string;
}

export function getIndent(indentSize?: number) {
  return " ".repeat(indentSize ?? 4);
}
