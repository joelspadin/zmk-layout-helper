export interface QmkKey {
    label?: string;
    matrix: [number, number];
    x: number;
    y: number;
    w?: number;
    h?: number;
    r?: number;
    rx?: number;
    ry?: number;
    encoder?: number;
}

export interface QmkLayout {
    layout: QmkKey[];
}

export interface QmkJson {
    layouts: Record<string, QmkLayout>;
}

export function parseQmkJson(text: string) {
    // TODO: validate the data
    return JSON.parse(text) as QmkJson;
}

export function getQmkLayoutNodeName(key: string) {
    return key.toLowerCase().trim();
}

export function getQmkLayoutDisplayName(key: string) {
    return key
        .replace(/^LAYOUT_/, '')
        .replace(/_/g, ' ')
        .trim();
}
