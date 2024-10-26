/**
 * https://github.com/nickcoutsos/keymap-layout-tools/blob/main/helper-app/src/Importers/KeyboardLayoutEditor/parser.js
 *
 * MIT License
 *
 * Copyright (c) 2023 Nikolaos Coutsos
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import JSONParser from '@streamparser/json/jsonparser.js';

export interface KleKey {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
    rx: number;
    ry: number;
}

export interface KleKeyboard {
    name: string;
    keys: KleKey[];
}

export function parseKle(text: string): KleKeyboard[] {
    const result: KleKeyboard[] = [];

    const parser = new JSONParser({ separator: '' });
    parser.onValue = ({ value, stack }) => {
        if (stack.length > 0) {
            return;
        }

        console.log(value);
        if (Array.isArray(value)) {
            result.push(parseKleKeyboard(value));
        }
    };

    parser.write(text);

    return result;
}

function parseKleKeyboard(data: unknown[]): KleKeyboard {
    const keyboard: KleKeyboard = { name: '', keys: [] };
    const current = { x: 0, y: 0, w: 1, h: 1, r: 0, rx: 0, ry: 0 };

    if (!Array.isArray(data[0])) {
        const meta = data.shift();
        if (isMetadata(meta)) {
            if (meta.name) {
                keyboard.name = meta.name;
            }
        }
    }

    for (const row of data) {
        if (!Array.isArray(row)) {
            throw Error(`Expected an array but got ${row}`);
        }

        for (const obj of row) {
            if (typeof obj === 'string') {
                const key = { ...current };
                keyboard.keys.push(key);

                current.x += current.w;
                current.w = 1;
                current.h = 1;
            } else if (isKeyItem(obj)) {
                if (obj.r !== undefined) {
                    current.r = obj.r;
                }
                if (obj.rx !== undefined) {
                    current.rx = obj.rx;
                    current.x = obj.rx;
                    current.y = current.ry;
                }
                if (obj.ry !== undefined) {
                    current.y = obj.ry;
                    current.ry = obj.ry;
                }

                current.x += obj.x ?? 0;
                current.y += obj.y ?? 0;
                current.w = obj.w ?? 1;
                current.h = obj.h ?? 1;
            } else {
                throw Error(`Expected key object but got ${obj}`);
            }
        }

        current.y += 1;
        current.x = current.rx;
    }

    return keyboard;
}

interface Metadata {
    name?: string;
}

function isMetadata(obj: unknown): obj is Metadata {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    if ('name' in obj && typeof obj.name !== 'string') {
        return false;
    }

    return true;
}

interface KeyItem {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    r?: number;
    rx?: number;
    ry?: number;
}

function isKeyItem(obj: unknown): obj is KeyItem {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    if ('x' in obj && typeof obj.x !== 'number') {
        return false;
    }
    if ('y' in obj && typeof obj.y !== 'number') {
        return false;
    }
    if ('w' in obj && typeof obj.w !== 'number') {
        return false;
    }
    if ('h' in obj && typeof obj.h !== 'number') {
        return false;
    }
    if ('r' in obj && typeof obj.r !== 'number') {
        return false;
    }
    if ('rx' in obj && typeof obj.rx !== 'number') {
        return false;
    }
    if ('ry' in obj && typeof obj.ry !== 'number') {
        return false;
    }

    return true;
}
