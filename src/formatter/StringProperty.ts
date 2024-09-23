import { Formattable } from "./Formattable";

export class StringProperty implements Formattable {
  constructor(
    public name: string,
    public value: string
  ) {}

  toString(): string {
    return `${this.name} = "${this.value}";`;
  }
}
