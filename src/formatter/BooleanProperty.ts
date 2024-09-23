import { Formattable } from "./Formattable";

export class BooleanProperty implements Formattable {
  constructor(public name: string) {}

  toString(): string {
    return this.name + ";";
  }
}
