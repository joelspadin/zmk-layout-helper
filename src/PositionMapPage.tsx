import {
  Button,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
  Tooltip,
  typographyStyles,
} from "@fluentui/react-components";
import { AddRegular, DeleteRegular } from "@fluentui/react-icons";
import chroma from "chroma-js";
import { HTMLAttributes, useCallback, useMemo, useState } from "react";
import { getGradient, KEY_HOVER_COLOR, KEY_SELECTED_COLOR } from "./colors";
import { Key } from "./keyboard/Key";
import { Keyboard } from "./keyboard/Keyboard";
import { ParseError } from "./parser/devicetree";
import { parseLayouts } from "./parser/layout";
import { getNodeRange } from "./parser/position";
import { PhysicalLayout, PositionMap } from "./types";
import { useDeviceTree } from "./useDeviceTree";
import { useParser } from "./useParser";

interface State {
  layouts: PhysicalLayout[];
  positionMap: PositionMap;
  length: number;
}

export const PositionMapPage: React.FC = () => {
  const classes = useStyles();
  const parser = useParser();
  const [devicetree] = useDeviceTree();

  // TODO: move all of this state up so it isn't cleared when switching tabs
  const [selectedMapIndex, setSelectedMapIndex] = useState<number>();
  const [hoverMapIndex, setHoverMapIndex] = useState<number>();
  const [state, setState] = useState<State>({
    layouts: [],
    positionMap: { path: "", label: "", complete: false, children: [] },
    length: 0,
  });

  const parsed = useMemo(() => {
    try {
      return parseLayouts(parser, devicetree);
    } catch (ex) {
      if (ex instanceof ParseError) {
        console.error(getNodeRange(devicetree, ex.node).toString(), ex.message);
      } else {
        throw ex;
      }
    }
  }, [parser, devicetree]);

  const [prevMap, setPrevMap] = useState<PositionMap>();
  const [prevLayouts, setPrevLayouts] = useState<PhysicalLayout[]>();
  if (
    parsed &&
    (parsed.positionMap !== prevMap || parsed.layouts !== prevLayouts)
  ) {
    setPrevMap(parsed.positionMap);
    setPrevLayouts(parsed.layouts);
    setState(makeInitialState(parsed.layouts, parsed.positionMap));
  }

  const keyCount = useMemo(() => {
    return state.layouts.reduce(
      (prev, item) => Math.max(prev, item.keys.length),
      0
    );
  }, [state.layouts]);

  const gradient = useMemo(() => {
    const length =
      state.positionMap?.children
        .map((item) => item.positions.length)
        .reduce((a, b) => Math.max(a, b), 1) ?? 1;

    return getGradient().domain([0, length]);
  }, [state.positionMap]);

  const setMapKey = useCallback(
    (layout: string, mapIndex?: number, keyIndex?: number) => {
      if (mapIndex === undefined || keyIndex === undefined) {
        return;
      }

      setState((s) => {
        return {
          ...s,
          positionMap: assignPositionMapKey(
            s.positionMap,
            layout,
            mapIndex,
            keyIndex
          ),
        };
      });
    },
    [setState]
  );

  const addRow = useCallback(() => {
    setState((s) => {
      return {
        ...s,
        positionMap: addPositionMapIndex(s.positionMap),
        length: s.length + 1,
      };
    });
    setSelectedMapIndex(state.length);
  }, [state, setState, setSelectedMapIndex]);

  const deleteRow = useCallback(
    (index: number) => {
      setState((s) => {
        return {
          ...s,
          positionMap: removePositionMapIndex(s.positionMap, index),
          length: s.length - 1,
        };
      });
    },
    [setState]
  );

  return (
    <div className={classes.root}>
      <div className={classes.listWrap}>
        <div className={classes.layoutList}>
          {state.layouts.map((layout) => {
            const map = state?.positionMap?.children.find(
              (item) => item.physicalLayout === layout.label
            );

            return (
              <Keyboard
                key={layout.path}
                layout={layout}
                positionMap={map}
                keyCount={keyCount}
                gradient={gradient}
                selectedMapIndex={selectedMapIndex}
                hoverMapIndex={hoverMapIndex}
                onKeySelected={(data) =>
                  setMapKey(layout.label, selectedMapIndex, data.keyIndex)
                }
                onKeyHovered={(data) => setHoverMapIndex(data?.mapIndex)}
              />
            );
          })}
        </div>
      </div>
      <div className={classes.listWrap}>
        <table className={classes.mapList}>
          <thead>
            <PositionMapHeader
              layouts={state.layouts}
              positionMap={state.positionMap}
            />
          </thead>

          <tbody>
            {[...Array(state.length).keys()].map((i) => {
              return (
                <PositionMapRow
                  key={i}
                  index={i}
                  positionMap={state.positionMap}
                  gradient={gradient}
                  selected={i === selectedMapIndex}
                  onClick={() => setSelectedMapIndex(i)}
                  onMouseOver={() => setHoverMapIndex(i)}
                  onMouseLeave={() => setHoverMapIndex(undefined)}
                  onDelete={(index) => deleteRow(index)}
                />
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={state.layouts.length + 1}
                className={classes.mapListFooter}
              >
                <Button icon={<AddRegular />} onClick={() => addRow()}>
                  Add group
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

interface PositionMapHeaderProps {
  layouts: PhysicalLayout[];
  positionMap: PositionMap;
}

const PositionMapHeader: React.FC<PositionMapHeaderProps> = ({
  layouts,
  positionMap,
}) => {
  const classes = useStyles();

  return (
    <tr>
      {positionMap.children.map((item) => {
        const layout = layouts.find((l) => l.label === item.physicalLayout);

        return (
          <th key={item.path} className={classes.mapListHeader}>
            {layout?.displayName ?? "&" + item.physicalLayout}
          </th>
        );
      })}
      <th></th>
    </tr>
  );
};

interface PositionMapRowProps extends HTMLAttributes<HTMLTableRowElement> {
  index: number;
  positionMap: PositionMap;
  gradient: chroma.Scale<chroma.Color>;

  selected: boolean;

  onDelete?: (index: number) => void;
}

const PositionMapRow: React.FC<PositionMapRowProps> = ({
  index,
  positionMap,
  gradient,
  selected,
  onDelete,
  className,
  ...props
}) => {
  const classes = useStyles();

  return (
    <tr
      className={mergeClasses(
        className,
        classes.mapListRow,
        selected && classes.selected
      )}
      {...props}
    >
      {positionMap.children.map((item, i) => {
        const keyIndex = item.positions[index];

        return (
          <td key={i}>
            <div className={classes.keyWrapper}>
              <Key
                className={classes.key}
                color={keyIndex === undefined ? undefined : gradient(index)}
              >
                {keyIndex ?? "__"}
              </Key>
            </div>
          </td>
        );
      })}

      <td className={classes.actions}>
        <Tooltip
          content={`Delete group ${index}`}
          relationship="label"
          positioning="after"
          withArrow
        >
          <Button icon={<DeleteRegular />} onClick={() => onDelete?.(index)} />
        </Tooltip>
      </td>
    </tr>
  );
};

const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplate: "auto / max-content max-content",
    width: "max-content",

    marginLeft: "auto",
    marginRight: "auto",
  },
  listWrap: {
    maxHeight: "calc(100vh - 44px)",
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarGutter: "stable",
  },
  layoutList: {
    display: "flex",
    flexFlow: "column",
    alignItems: "center",
    minWidth: "400px",
    ...shorthands.margin(tokens.spacingVerticalM, "48px"),
  },
  mapList: {
    borderSpacing: `0 ${tokens.spacingVerticalXS}`,
    ...shorthands.margin(tokens.spacingVerticalM, tokens.spacingHorizontalXL),
  },
  mapListHeader: {
    writingMode: "vertical-lr",
    textAlign: "end",
    paddingInlineEnd: tokens.spacingVerticalS,

    transform: "translate3d(0, 0, 0)",

    ...typographyStyles.subtitle2,
  },
  mapListFooter: {
    height: "40px",
    textAlign: "center",
  },
  mapListRow: {
    borderRadius: tokens.borderRadiusMedium,

    "& td:not(:last-child)": {
      paddingRight: tokens.spacingHorizontalXS,
    },

    ":hover": {
      backgroundColor: KEY_HOVER_COLOR,
      outline: `2px solid ${KEY_HOVER_COLOR}`,
    },
  },
  keyWrapper: {
    padding: "1px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: `calc(${tokens.borderRadiusMedium} + 1px)`,
  },
  key: {
    width: "38px",
    height: "38px",
  },
  selected: {
    backgroundColor: KEY_SELECTED_COLOR,
    outline: `2px solid ${KEY_SELECTED_COLOR}`,
  },
  actions: {
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalXS,
  },
});

function makeInitialState(
  layouts: PhysicalLayout[] | undefined,
  positionMap: PositionMap | undefined
): State {
  layouts ??= [];

  // Layouts must have labels
  const newLayouts = layouts.map((layout, i) => {
    return {
      ...layout,
      label: layout.label || layout.path.split("/").pop() || `layout_${i}`,
    };
  });

  const newMap: PositionMap = {
    path: positionMap?.path ?? "/position_map",
    label: positionMap?.label ?? "",
    complete: positionMap?.complete ?? false,
    children: [],
  };

  // Make sure there is a position map item for every layout, and they are in
  // the same order as the layouts.
  for (const layout of layouts) {
    const existingItem = positionMap?.children.find(
      (map) => map.physicalLayout === layout.label
    );

    newMap.children.push({
      path: newMap.path + "/" + layout.label,
      label: "",
      physicalLayout: layout.label,
      positions: [],
      ...existingItem,
    });
  }

  const length = newMap.children.reduce(
    (prev, item) => Math.max(prev, item.positions.length),
    0
  );

  return {
    layouts: newLayouts,
    positionMap: newMap,
    length,
  };
}

function assignPositionMapKey(
  positionMap: PositionMap,
  layout: string,
  mapIndex: number,
  keyIndex: number
): PositionMap {
  return {
    ...positionMap,
    children: positionMap.children.map((item) => {
      if (item.physicalLayout !== layout) {
        return item;
      }

      const positions = item.positions.map((key, i) => {
        if (i === mapIndex) {
          return keyIndex;
        }

        if (key === keyIndex) {
          return item.positions[mapIndex];
        }

        return key;
      });

      return { ...item, positions };
    }),
  };
}

function addPositionMapIndex(positionMap: PositionMap): PositionMap {
  return {
    ...positionMap,
    children: positionMap.children.map((item) => {
      return {
        ...item,
        positions: [...item.positions, undefined],
      };
    }),
  };
}

function removePositionMapIndex(
  positionMap: PositionMap,
  index: number
): PositionMap {
  return {
    ...positionMap,
    children: positionMap.children.map((item) => {
      const positions = [...item.positions];
      positions.splice(index);

      return {
        ...item,
        positions,
      };
    }),
  };
}
