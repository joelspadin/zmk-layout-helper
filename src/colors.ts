import { tokens } from '@fluentui/react-components';
import chroma from 'chroma-js';

const COLORS = ['#f9ddda', '#f2b9c4', '#e597b9', '#ce78b3', '#ad5fad', '#834ba0', '#573b88'];

/**
 * Just the parts of chroma.Scale<chroma.Color> we actually use, so this can be
 * replaced by other types of color scales, such as categorical instead of a
 * gradient.
 */
export interface ColorScale {
    (value: number): chroma.Color;
    domain(d: [number, number]): this;
}

/**
 * Get the color scale to use for keys.
 */
export function getColorScale(): ColorScale {
    return chroma.scale(COLORS);
}

/**
 * Gets a dark or light color which has the greatest contrast against the given
 * background color. The return value is a CSS variable rather than a color object.
 */
export function getTextColor(backgroundColor: chroma.Color) {
    const lightContrast = chroma.contrast(backgroundColor, 'ffffff');
    const darkContrast = chroma.contrast(backgroundColor, '#242424');

    return lightContrast > darkContrast ? tokens.colorNeutralForeground1 : tokens.colorNeutralForegroundInverted;
}

export const KEY_SELECTED_COLOR = tokens.colorPaletteLightTealBorderActive;
export const KEY_HOVER_COLOR = tokens.colorPaletteYellowBorderActive;
