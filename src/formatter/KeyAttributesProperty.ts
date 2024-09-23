import { KeyAttributes } from "../types";
import { dtnum, lpad } from "../utility";
import { Formattable } from "./Formattable";

function keystr(strings: TemplateStringsArray, ...args: number[]) {
  const widths = [3, 3, 4, 4, 7, 6, 6];

  let result = strings[0];

  for (let i = 0; i < args.length; i++) {
    const rounded = Math.round(args[i] * 100);
    const padded = lpad(dtnum(rounded), widths[i]);

    result += padded + strings[i + 1];
  }

  return result;
}

export class KeyAttributesProperty implements Formattable {
  constructor(public keys: KeyAttributes[]) {}

  toString(): string {
    const items = this.keys
      .map(
        (k) =>
          keystr`<&key_physical_attrs ${k.width} ${k.height} ${k.position[0]} ${k.position[1]} ${k.rotation} ${k.origin[0]} ${k.origin[1]}>`
      )
      .join("\n    , ");

    return (
      "keys  //                     w   h    x    y     rot     rx     ry" +
      "\n    = " +
      items +
      "\n    ;"
    );
  }
}
