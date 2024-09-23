import { indent } from "../utility";
import { Formattable, getIndent } from "./Formattable";
import { Spacer } from "./Spacer";

export class Node implements Formattable {
  private children: Formattable[] = [];

  constructor(
    public name: string,
    public label = ""
  ) {}

  toString(indentSize?: number): string {
    let identifier = this.name;
    if (this.label) {
      identifier = this.label + ": " + identifier;
    }

    const contents = this.children
      .map((c) => c.toString(indentSize))
      .join("\n");

    return `\
${identifier} {
${indent(contents, 1, getIndent(indentSize))}
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
