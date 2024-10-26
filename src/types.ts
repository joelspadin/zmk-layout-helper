import { Dispatch, SetStateAction } from 'react';

export interface NodeId {
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

export interface PhysicalLayout extends NodeId {
    displayName: string;
    keys: KeyAttributes[];
    transform: string;
    kscan: string;
}

export interface PositionMapItem extends NodeId {
    physicalLayout: string;
    positions: (number | undefined)[];
}

export interface PositionMap extends NodeId {
    complete: boolean;
    children: PositionMapItem[];
}

export type Point = [number, number];

export type ImportFormat = 'devicetree' | 'kle';

export interface ImportState {
    format: ImportFormat;
    setFormat: Dispatch<SetStateAction<ImportFormat>>;
    code: string;
    setCode: Dispatch<SetStateAction<string>>;
    importCode: () => void;
}

export interface EditState {
    layouts: PhysicalLayout[];
    positionMap: PositionMap;
    keyCount: number;
}
