import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import hljs from "highlight.js";
import dts from "highlight.js/lib/languages/dts";
import "highlight.js/styles/github-dark.css";
import { useMemo } from "react";
import { EditState, KeyAttributes } from "./types";
import { useEditState } from "./useEditState";
import { chunks, dtnum, indent, lpad } from "./utility";

hljs.registerLanguage("dts", dts);

export const ExportPage: React.FC = () => {
  const classes = useStyles();
  const [state] = useEditState();

  const devicetree = useMemo(() => formatDevicetree(state), [state]);

  const highlighted = useMemo(
    () => hljs.highlight(devicetree, { language: "dts" }).value,
    [devicetree]
  );

  // TODO: add a copy button
  // TODO: add download button
  // TODO: warn if some positions are undefined

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <pre className={mergeClasses("hljs", classes.textarea)}>
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
};

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "start",

    marginTop: tokens.spacingVerticalM,
  },
  wrapper: {
    overflow: "hidden",
    borderRadius: tokens.borderRadiusMedium,
    scrollbarColor: `${tokens.colorNeutralForeground3} ${tokens.colorNeutralBackground3}`,
    boxShadow: tokens.shadow4,
  },
  textarea: {
    boxSizing: "border-box",

    width: "800px",
    maxWidth: "calc(100vw - 48px)",
    height: `calc(100vh - 48px - ${tokens.spacingVerticalM} * 2)`,
    maxHeight: "unset",
    overflow: "auto",

    margin: 0,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),

    fontFamily: tokens.fontFamilyMonospace,
  },
});

function formatDevicetree(state: EditState): string {
  const tree = new Tree(state);

  return tree.root.toString();
}

interface Formattable {
  toString(): string;
}

class Spacer implements Formattable {
  toString(): string {
    return "";
  }
}

class BooleanProperty implements Formattable {
  constructor(public name: string) {}

  toString(): string {
    return this.name + ";";
  }
}

class StringProperty implements Formattable {
  constructor(
    public name: string,
    public value: string
  ) {}

  toString(): string {
    return `${this.name} = "${this.value}";`;
  }
}

class PhandleProperty implements Formattable {
  constructor(
    public name: string,
    public label: string
  ) {}

  toString(): string {
    return `${this.name} = <&${this.label}>;`;
  }
}

const ARRAY_ROW_SIZE = 20;

function formatRow(row: number[], digits: number) {
  return `<${row.map((x) => lpad(dtnum(x), digits)).join(" ")}>`;
}

class ArrayProperty implements Formattable {
  constructor(
    public name: string,
    public values: number[]
  ) {}

  toString(): string {
    const digits = Math.ceil(Math.log10(Math.max(...this.values)));

    if (this.values.length <= ARRAY_ROW_SIZE) {
      return `${this.name} = ${formatRow(this.values, digits)};`;
    }

    const rows = chunks(this.values, ARRAY_ROW_SIZE);

    return (
      this.name +
      "\n    = " +
      rows.map((row) => formatRow(row, digits)).join("\n    , ") +
      "\n    ;"
    );
  }
}

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

class KeyAttributesProperty implements Formattable {
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

class Node implements Formattable {
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

class Tree {
  public root: Node = new Node("/");

  constructor(state: EditState) {
    for (const layout of state.layouts) {
      const node = this.addNode(layout.path, layout.label);
      node.addChild(new StringProperty("compatible", "zmk,physical-layout"));
      node.addChild(new StringProperty("display-name", layout.displayName));

      if (layout.kscan) {
        node.addChild(new PhandleProperty("kscan", layout.kscan));
      }

      if (layout.transform) {
        node.addChild(new PhandleProperty("transform", layout.transform));
      }

      node.addSpacer();
      node.addChild(new KeyAttributesProperty(layout.keys));
    }

    const map = this.addNode(state.positionMap.path, state.positionMap.label);
    map.addChild(
      new StringProperty("compatible", "zmk,physical-layout-position-map")
    );

    if (state.positionMap.complete) {
      map.addSpacer();
      map.addChild(new BooleanProperty("complete"));
    }

    for (const mapItem of state.positionMap.children) {
      const mapNode = this.addNode(mapItem.path, mapItem.label);
      mapNode.addChild(
        new PhandleProperty("physical-layout", mapItem.physicalLayout)
      );
      mapNode.addChild(
        new ArrayProperty(
          "positions",
          mapItem.positions.filter((v) => v !== undefined)
        )
      );
    }
  }

  addNode(path: string, label = ""): Node {
    let result = this.root;
    let parts = path.split("/").slice(1);

    while (parts.length > 0) {
      const name = parts[0];

      const node = result.findChild(name);
      if (node) {
        result = node;
      } else {
        const child = new Node(name);
        result.addChild(child);
        result = child;
      }

      parts = parts.slice(1);
    }

    if (label) {
      result.label = label;
    }

    return result;
  }
}
