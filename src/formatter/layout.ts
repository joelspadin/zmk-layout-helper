import { EditState } from "../types";
import { ArrayProperty } from "./ArrayProperty";
import { BooleanProperty } from "./BooleanProperty";
import { PhandleProperty } from "./PhandleProperty";
import { StringProperty } from "./StringProperty";
import { Tree } from "./Tree";

export function formatLayout(state: EditState): string {
  const tree = new Tree();

  // TODO: export layouts if a layout editor or importing from non-devicetree format is added.
  // for (const layout of state.layouts) {
  //   const node = tree.addNode(layout.path, layout.label);
  //   node.addChild(new StringProperty("compatible", "zmk,physical-layout"));
  //   node.addChild(new StringProperty("display-name", layout.displayName));

  //   if (layout.kscan) {
  //     node.addChild(new PhandleProperty("kscan", layout.kscan));
  //   }

  //   if (layout.transform) {
  //     node.addChild(new PhandleProperty("transform", layout.transform));
  //   }

  //   node.addSpacer();
  //   node.addChild(new KeyAttributesProperty(layout.keys));
  // }

  const map = tree.addNode(state.positionMap.path, state.positionMap.label);
  map.addChild(
    new StringProperty("compatible", "zmk,physical-layout-position-map")
  );

  if (state.positionMap.complete) {
    map.addSpacer();
    map.addChild(new BooleanProperty("complete"));
  }

  for (const mapItem of state.positionMap.children) {
    const mapNode = tree.addNode(mapItem.path, mapItem.label);
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

  return tree.root.toString();
}
