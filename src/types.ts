export interface Node {
  name: string;
  label?: string;
}

export interface KeyAttributes {
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  rx: number;
  ry: number;
}

export interface PhysicalLayout extends Node {
  displayName: string;
  keys: KeyAttributes[];
  transform: string;
  kscan: string;
}

export interface PositionMapItem extends Node {
  physicalLayout: string;
  positions: number[];
}

export interface PositionMap extends Node {
  complete: boolean;
  children: PositionMapItem[];
}
