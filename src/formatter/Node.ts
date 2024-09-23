import { indent } from "../utility";
import { Formattable } from "./Formattable";
import { Spacer } from "./Spacer";

export class Node implements Formattable {
  private children: Formattable[] = [];

  constructor(
    public name: string,
    public label = ""
  ) {}

  toString(): string {
    let identifier = this.name;
    if (this.label) {
      identifier = this.label + ": " + identifier;
    }

    const contents = this.children.map((c) => c.toString()).join("\n");

    return `\
${identifier} {
${indent(contents)}
};`;
  }

  findChild(name: string): Node | undefined {
    return this.children
      .filter((c) => c instanceof Node)
      .find((c) => c.name === name);
  }

  addChild(child: Formattable) {
    if (child instanceof Node && this.children.length > 0) {
      this.addSpacer();
    }

    this.children.push(child);
  }

  addSpacer() {
    this.children.push(new Spacer());
  }
}
