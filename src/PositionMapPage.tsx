import {
  Button,
  InfoLabel,
  makeStyles,
  mergeClasses,
  MessageBar,
  MessageBarBody,
  shorthands,
  Switch,
  tokens,
  typographyStyles,
} from "@fluentui/react-components";
import { AddRegular, DeleteRegular } from "@fluentui/react-icons";
import chroma from "chroma-js";
import { HTMLAttributes, useCallback, useMemo, useState } from "react";
import { getGradient, KEY_HOVER_COLOR, KEY_SELECTED_COLOR } from "./colors";
import { Key } from "./keyboard/Key";
import { Keyboard } from "./keyboard/Keyboard";
import { PhysicalLayout, PositionMap } from "./types";
import { useEditState } from "./useEditState";
import { maxValue } from "./utility";

export const PositionMapPage: React.FC = () => {
  const classes = useStyles();

  const [selectedMapIndex, setSelectedMapIndex] = useState<number>();
  const [hoverMapIndex, setHoverMapIndex] = useState<number>();
  const [state, setState] = useEditState();

  const keyCount = useMemo(
    () => maxValue(state.layouts, (item) => item.keys.length, 0),
    [state.layouts]
  );

  const gradient = useMemo(
    () => getGradient().domain([0, state.length]),
    [state.length]
  );

  const setComplete = useCallback(
    (complete: boolean) => {
      setState((s) => {
        return {
          ...s,
          positionMap: {
            ...s.positionMap,
            complete,
          },
        };
      });
    },
    [setState]
  );

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

  if (state.layouts.length === 0) {
    return (
      <div className={classes.root}>
        <MessageBar intent="error" shape="rounded" className={classes.error}>
          <MessageBarBody>
            The devicetree data could not be parsed or contains no physical
            layout nodes.
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.listWrap}>
        <div className={classes.layoutList}>
          {state.layouts.map((layout) => {
            const map = findPositionMap(state.positionMap, layout.label);

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
      <div className={mergeClasses(classes.listWrap, classes.mapList)}>
        <table className={classes.mapTable}>
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
                  Add
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className={mergeClasses(classes.listWrap, classes.settingsList)}>
        <Switch
          label={
            <InfoLabel info="Indicates that all keys are in the map, and no fallback matching should occur.">
              Complete
            </InfoLabel>
          }
          checked={state.positionMap.complete}
          onChange={(ev, data) => setComplete(data.checked)}
        />
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
    <tr className={classes.stickyHeader}>
      {positionMap.children.map((item) => {
        const layout = findLayout(layouts, item.physicalLayout);

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
            <Key
              className={classes.key}
              color={keyIndex === undefined ? undefined : gradient(index)}
            >
              {keyIndex ?? "__"}
            </Key>
          </td>
        );
      })}

      <td className={classes.actions}>
        <Button icon={<DeleteRegular />} onClick={() => onDelete?.(index)} />
      </td>
    </tr>
  );
};

const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplate: "auto / max-content max-content max-content",
    width: "max-content",

    marginLeft: "auto",
    marginRight: "auto",
  },
  error: {
    marginTop: tokens.spacingVerticalM,
  },
  listWrap: {
    boxSizing: "border-box",
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
    ...shorthands.padding(
      0,
      tokens.spacingHorizontalXL,
      tokens.spacingVerticalM
    ),
  },

  settingsList: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
  },

  mapTable: {
    marginBottom: tokens.spacingVerticalS,
    borderSpacing: `0 ${tokens.spacingVerticalXS}`,
    // Undo the border spacing at the top so the sticky header doesn't move.
    marginTop: `calc(${tokens.spacingVerticalXS} * -1)`,
  },

  stickyHeader: {
    position: "sticky",
    top: 0,

    backgroundColor: tokens.colorNeutralBackground2,

    // Hide the 2px outline of selected/hovered rows.
    outline: `2px solid ${tokens.colorNeutralBackground2}`,
  },

  mapListHeader: {
    writingMode: "vertical-lr",
    textAlign: "end",
    paddingInlineStart: tokens.spacingVerticalM,
    paddingInlineEnd: tokens.spacingVerticalS,

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
  key: {
    width: "32px",
    height: "32px",
    border: `1px solid ${tokens.colorNeutralBackground2}`,
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

function findPositionMap(positionMap: PositionMap, layoutLabel: string) {
  return positionMap.children.find(
    (item) => item.physicalLayout === layoutLabel
  );
}

function findLayout(layouts: PhysicalLayout[], layoutLabel: string) {
  return layouts.find((item) => item.label === layoutLabel);
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
      positions.splice(index, 1);

      return {
        ...item,
        positions,
      };
    }),
  };
}
