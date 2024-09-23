import { chunks, dtnum, lpad } from "../utility";
import { Formattable } from "./Formattable";

function formatRow(row: number[], digits: number) {
  return `<${row.map((x) => lpad(dtnum(x), digits)).join(" ")}>`;
}

export class ArrayProperty implements Formattable {
  constructor(
    public name: string,
    public values: number[],
    public numColumns = 0
  ) {}

  toString(): string {
    const digits = Math.ceil(Math.log10(Math.max(...this.values)));

    if (this.values.length <= this.numColumns) {
      return `${this.name} = ${formatRow(this.values, digits)};`;
    }

    const rows = chunks(this.values, this.numColumns);

    return (
      this.name +
      "\n    = " +
      rows.map((row) => formatRow(row, digits)).join("\n    , ") +
      "\n    ;"
    );
  }
}
