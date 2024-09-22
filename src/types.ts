export interface Node {
  path: string;
  label: string;
}

export interface KeyAttributes {
  position: Point;
  width: number;
  height: number;
  rotation: number;
  origin: Point;
}

export interface PhysicalLayout extends Node {
  displayName: string;
  keys: KeyAttributes[];
  transform: string;
  kscan: string;
}

export interface PositionMapItem extends Node {
  physicalLayout: string;
  positions: (number | undefined)[];
}

export interface PositionMap extends Node {
  complete: boolean;
  children: PositionMapItem[];
}

export type Point = [number, number];

export interface EditState {
  layouts: PhysicalLayout[];
  positionMap: PositionMap;
  length: number;
}
