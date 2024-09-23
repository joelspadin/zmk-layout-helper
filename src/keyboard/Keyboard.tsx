import chroma from "chroma-js";

import {
  makeStyles,
  shorthands,
  tokens,
  typographyStyles,
} from "@fluentui/react-components";
import { CSSProperties, useMemo } from "react";
import { KEY_HOVER_COLOR } from "../colors";
import {
  KeyAttributes,
  PhysicalLayout,
  Point,
  PositionMapItem,
} from "../types";
import { Key } from "./Key";

const DEFAULT_KEY_SIZE = 38;
const DEFAULT_GAP_SIZE = 4;

export interface KeyData {
  keyIndex?: number;
  mapIndex?: number;
}

export interface KeyboardProps {
  layout: PhysicalLayout;
  positionMap?: PositionMapItem;
  keyCount?: number;
  keySize?: number;
  gapSize?: number;
  gradient?: chroma.Scale<chroma.Color>;
  selectedMapIndex?: number;
  hoverMapIndex?: number;

  onKeySelected?: (data: KeyData) => void;
  onKeyHovered?: (data: KeyData | undefined) => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  layout,
  positionMap,
  keyCount,
  keySize,
  gapSize,
  gradient,
  selectedMapIndex,
  hoverMapIndex,
  onKeyHovered,
  onKeySelected,
}) => {
  const classes = useStyles();

  keySize ??= DEFAULT_KEY_SIZE;
  gapSize ??= DEFAULT_GAP_SIZE;
  const unitSize = keySize + gapSize;

  const bounds = useMemo(() => {
    return getLayoutBounds(layout, unitSize, gapSize);
  }, [layout, unitSize, gapSize]);

  const extraKeys = useMemo(() => {
    const extraCount = Math.max(0, (keyCount ?? 0) - layout.keys.length);

    return [...Array(extraCount).keys()].map((i) => layout.keys.length + i);
  }, [layout, keyCount]);

  return (
    <div className={classes.wrapper}>
      <h2 className={classes.header}>{layout.displayName}</h2>
      <div className={classes.keyboard} style={getKeyboardStyle(bounds)}>
        {layout.keys.map((key, keyIndex) => {
          const mapIndex = getMapIndex(keyIndex, positionMap);
          const style = getKeyStyle(key, bounds, unitSize, gapSize);
          const color = getKeyColor(mapIndex, gradient);

          return (
            <Key
              className={classes.key}
              key={keyIndex}
              style={style}
              color={color}
              selected={getSelected(mapIndex, selectedMapIndex)}
              hover={getSelected(mapIndex, hoverMapIndex)}
              onClick={() => onKeySelected?.({ keyIndex, mapIndex })}
              onMouseEnter={() => onKeyHovered?.({ keyIndex, mapIndex })}
              onMouseLeave={() => onKeyHovered?.(undefined)}
            >
              {keyIndex}
            </Key>
          );
        })}
      </div>
      {extraKeys.length > 0 && (
        <>
          <h3 className={classes.extraKeysHeader}>Unused Positions</h3>
          <div className={classes.extraKeysList}>
            {extraKeys.map((keyIndex) => {
              const mapIndex = getMapIndex(keyIndex, positionMap);
              const color = getKeyColor(mapIndex, gradient);
              const style = getExtraKeyStyle(keySize, gapSize);

              return (
                <Key
                  className={classes.key}
                  key={keyIndex}
                  style={style}
                  color={color}
                  selected={getSelected(mapIndex, selectedMapIndex)}
                  hover={getSelected(mapIndex, hoverMapIndex)}
                  onClick={() => onKeySelected?.({ keyIndex, mapIndex })}
                  onMouseEnter={() => onKeyHovered?.({ keyIndex, mapIndex })}
                  onMouseLeave={() => onKeyHovered?.(undefined)}
                >
                  {keyIndex}
                </Key>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const useStyles = makeStyles({
  wrapper: {
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
  },
  header: {
    display: "flex",
    justifyContent: "center",
    marginTop: 0,
    marginBottom: tokens.spacingVerticalM,
    ...typographyStyles.subtitle2,
  },
  keyboard: {
    position: "relative",
  },
  key: {
    ":hover": {
      ...shorthands.borderColor(tokens.colorStrokeFocus1),
      outline: `2px solid ${KEY_HOVER_COLOR}`,
    },
  },
  extraKeysHeader: {
    ...typographyStyles.body2,
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalS,
  },
  extraKeysList: {
    display: "flex",
    flexFlow: "row wrap",
  },
});

function getMapIndex(
  index: number | undefined,
  positionMap: PositionMapItem | undefined
) {
  if (index === undefined || positionMap === undefined) {
    return undefined;
  }

  const mapIndex = positionMap?.positions.indexOf(index);
  return mapIndex >= 0 ? mapIndex : undefined;
}

function getSelected(
  mapIndex: number | undefined,
  selectedMapIndex: number | undefined
) {
  return selectedMapIndex !== undefined && mapIndex === selectedMapIndex;
}

function getKeyColor(
  mapIndex: number | undefined,
  gradient: chroma.Scale<chroma.Color> | undefined
) {
  if (mapIndex === undefined || gradient === undefined) {
    return undefined;
  }

  return gradient(mapIndex);
}

function getKeyboardStyle(bounds: Bounds): CSSProperties {
  return {
    width: `${bounds.right - bounds.left}px`,
    height: `${bounds.bottom - bounds.top}px`,
  };
}

function getKeyStyle(
  key: KeyAttributes,
  bounds: Bounds,
  unitSize: number,
  gapSize: number
): CSSProperties {
  const [x, y] = key.position;
  const [rx, ry] = key.origin;

  const transformX = (rx - x) * unitSize;
  const transformY = (ry - y) * unitSize;

  return {
    position: "absolute",
    top: `${y * unitSize - bounds.top}px`,
    left: `${x * unitSize - bounds.left}px`,
    width: `${key.width * unitSize - gapSize}px`,
    height: `${key.height * unitSize - gapSize}px`,
    ...(key.rotation && {
      transformOrigin: `${transformX}px ${transformY}px`,
      transform: `rotate(${key.rotation}deg)`,
    }),
  };
}

function getExtraKeyStyle(keySize: number, gapSize: number) {
  return {
    width: `${keySize}px`,
    height: `${keySize}px`,
    marginRight: `${gapSize}px`,
    marginBottom: `${gapSize}px`,
  };
}

function translate(point: Point, offset: Point): Point {
  return [point[0] + offset[0], point[1] + offset[1]];
}

function scale(point: Point, factor: number): Point {
  return [point[0] * factor, point[1] * factor];
}

const DEG_TO_RAD = Math.PI / 180;

function rotate([x, y]: Point, degrees: number, [cx, cy]: Point): Point {
  const sin = Math.sin(degrees * DEG_TO_RAD);
  const cos = Math.cos(degrees * DEG_TO_RAD);

  x -= cx;
  y -= cy;

  const newX = x * cos - y * sin;
  const newY = x * sin + y * cos;

  return [newX + cx, newY + cy];
}

interface Bounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

function getLayoutBounds(
  layout: PhysicalLayout,
  unitSize: number,
  gapSize: number
): Bounds {
  if (layout.keys.length === 0) {
    return {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  }

  const corners = layout.keys.flatMap((key) => {
    const position = scale(key.position, unitSize);
    const origin = scale(key.origin, unitSize);

    const c1: Point = [0, 0];
    const c2: Point = [0, key.height * unitSize - gapSize];
    const c3: Point = [key.width * unitSize - gapSize, 0];
    const c4: Point = [
      key.width * unitSize - gapSize,
      key.height * unitSize - gapSize,
    ];

    return [c1, c2, c3, c4].map((c) =>
      rotate(translate(position, c), key.rotation, origin)
    );
  });

  const [firstX, firstY] = corners[0];
  const initial: Bounds = {
    top: firstY,
    left: firstX,
    right: firstX,
    bottom: firstY,
  };

  return corners.reduce((prev, current) => {
    const [x, y] = current;

    return {
      top: Math.min(prev.top, y),
      left: Math.min(prev.left, x),
      right: Math.max(prev.right, x),
      bottom: Math.max(prev.bottom, y),
    };
  }, initial);
}
