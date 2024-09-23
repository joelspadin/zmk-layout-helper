import { chunks, dtnum, lpad } from "../utility";
import { Formattable } from "./Formattable";

const DEFAULT_ROW_SIZE = 20;

function formatRow(row: number[], digits: number) {
  return `<${row.map((x) => lpad(dtnum(x), digits)).join(" ")}>`;
}

export class ArrayProperty implements Formattable {
  constructor(
    public name: string,
    public values: number[],
    public rowSize = DEFAULT_ROW_SIZE
  ) {}

  toString(): string {
    const digits = Math.ceil(Math.log10(Math.max(...this.values)));

    if (this.values.length <= this.rowSize) {
      return `${this.name} = ${formatRow(this.values, digits)};`;
    }

    const rows = chunks(this.values, this.rowSize);

    return (
      this.name +
      "\n    = " +
      rows.map((row) => formatRow(row, digits)).join("\n    , ") +
      "\n    ;"
    );
  }
}
