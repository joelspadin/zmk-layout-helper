import {
    Button,
    Field,
    InfoLabel,
    makeStyles,
    mergeClasses,
    MessageBar,
    MessageBarBody,
    shorthands,
    Slider,
    SpinButton,
    Switch,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { HTMLAttributes, MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { ColorScale, getColorScale, KEY_HOVER_COLOR, KEY_SELECTED_COLOR } from './colors';
import { Key } from './keyboard/Key';
import { Keyboard, KeyboardProps } from './keyboard/Keyboard';
import { ResetPositionMapPrompt } from './ResetPositionMapPrompt';
import { PhysicalLayout, PositionMap } from './types';
import { useAsyncModal } from './useAsyncModal';
import { useEditState } from './useEditState';
import { useLocalStorage } from './useLocalStorage';
import { useScrollToEnd } from './useScrollToEnd';
import { getMinKeyCount, maxValue } from './utility';

const KEY_SIZES: Record<number, Partial<KeyboardProps>> = {
    [0]: { keySize: 27, gapSize: 3 },
    [1]: { keySize: 32, gapSize: 4 },
    [2]: { keySize: 38, gapSize: 4 },
    [3]: { keySize: 44, gapSize: 4 },
};

const MIN_KEY_SIZE = 0;
const MAX_KEY_SIZE = 3;
const DEFAULT_KEY_SIZE = 2;

export const PositionMapPage: React.FC = () => {
    const classes = useStyles();

    const [confirmReset, renderConfirmModal] = useConfirmReset();

    const [selectedMapIndex, setSelectedMapIndex] = useState<number>();
    const [hoverMapIndex, setHoverMapIndex] = useState<number>();
    const [state, setState] = useEditState();

    // TODO: remember editor settings
    // const [autoAdd, setAutoAdd] = useLocalStorage('auto-add-item', true);
    const [keySize, setKeySize] = useLocalStorage('key-size', DEFAULT_KEY_SIZE);

    const listRef = useRef<HTMLDivElement>(null);
    const scrollToEnd = useScrollToEnd(listRef);

    const minKeyCount = useMemo(() => getMinKeyCount(state.layouts, state.positionMap), [state]);
    const length = useMemo(
        () => maxValue(state.positionMap.children, (item) => item.positions.length),
        [state.positionMap.children],
    );

    const gradient = useMemo(() => getColorScale().domain([0, length]), [length]);

    const keyProps = KEY_SIZES[keySize];

    const setKeyCount = useCallback(
        (keyCount: number) => {
            setState((s) => {
                return {
                    ...s,
                    keyCount,
                };
            });
        },
        [setState],
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
        [setState],
    );

    const setMapKey = useCallback(
        (layout: string, mapIndex?: number, keyIndex?: number) => {
            if (mapIndex === undefined || keyIndex === undefined) {
                return;
            }

            setState((s) => {
                return {
                    ...s,
                    positionMap: assignPositionMapKey(s.positionMap, layout, mapIndex, keyIndex),
                };
            });
        },
        [setState],
    );

    const addRow = useCallback(() => {
        setState((s) => {
            return {
                ...s,
                positionMap: addPositionMapIndex(s.positionMap),
            };
        });
        setSelectedMapIndex(length);
        scrollToEnd();
    }, [length, setState, setSelectedMapIndex, scrollToEnd]);

    const deleteRow = useCallback(
        (index: number) => {
            setState((s) => {
                return {
                    ...s,
                    positionMap: removePositionMapIndex(s.positionMap, index),
                };
            });
            setSelectedMapIndex((i) => (i === undefined ? undefined : i - (i > index ? 1 : 0)));
        },
        [setState, setSelectedMapIndex],
    );

    const resetMap = useCallback(async () => {
        if (await confirmReset()) {
            setState((s) => {
                return {
                    ...s,
                    positionMap: resetPositionMap(s.positionMap),
                };
            });
        }
    }, [confirmReset, setState]);

    if (state.layouts.length === 0) {
        return (
            <div className={classes.root}>
                <div>
                    <MessageBar intent="error" shape="rounded" className={classes.error}>
                        <MessageBarBody>
                            The data could not be parsed or contains no physical layout nodes.
                        </MessageBarBody>
                    </MessageBar>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            {/* Keyboard layout list */}
            <div className={mergeClasses(classes.list, classes.layoutList)}>
                {state.layouts.map((layout) => {
                    const map = findPositionMap(state.positionMap, layout.label);

                    return (
                        <Keyboard
                            key={layout.path}
                            layout={layout}
                            positionMap={map}
                            keyCount={state.keyCount}
                            colorScale={gradient}
                            selectedMapIndex={selectedMapIndex}
                            hoverMapIndex={hoverMapIndex}
                            onKeySelected={(data) => setMapKey(layout.label, selectedMapIndex, data.keyIndex)}
                            onKeyHovered={(data) => setHoverMapIndex(data?.mapIndex)}
                            {...keyProps}
                        />
                    );
                })}
            </div>

            {/* Position map list */}
            <div ref={listRef} className={mergeClasses(classes.list, classes.mapList)}>
                <table className={classes.mapTable}>
                    <thead className={mergeClasses(classes.sticky, classes.mapListHeader)}>
                        <PositionMapHeader layouts={state.layouts} positionMap={state.positionMap} />
                    </thead>

                    <tbody>
                        {[...Array(length).keys()].map((i) => {
                            return (
                                <PositionMapRow
                                    key={i}
                                    index={i}
                                    positionMap={state.positionMap}
                                    colorScale={gradient}
                                    selected={i === selectedMapIndex}
                                    onClick={() => setSelectedMapIndex(i)}
                                    onMouseOver={() => setHoverMapIndex(i)}
                                    onMouseLeave={() => setHoverMapIndex(undefined)}
                                    onDelete={(index) => deleteRow(index)}
                                />
                            );
                        })}
                    </tbody>
                </table>

                <div className={mergeClasses(classes.sticky, classes.mapListFooter)}>
                    <Button icon={<AddRegular />} onClick={() => addRow()}>
                        Add
                    </Button>
                </div>
            </div>

            {/* Settings */}
            <div className={mergeClasses(classes.list, classes.settingsList)}>
                <h3>Map settings</h3>
                <div className={classes.settingGroup}>
                    <Field label="Key count">
                        <SpinButton
                            value={state.keyCount}
                            onChange={(ev, data) => data.value && setKeyCount(data.value)}
                            min={minKeyCount}
                        />
                    </Field>
                    <Switch
                        label={
                            <InfoLabel info="Indicates that all keys are in the map, and no fallback matching should occur.">
                                Complete
                            </InfoLabel>
                        }
                        checked={state.positionMap.complete}
                        onChange={(ev, data) => setComplete(data.checked)}
                    />
                    <Button onClick={resetMap}>Reset map</Button>

                    {renderConfirmModal()}
                </div>
                <h3>Editor settings</h3>
                <div className={classes.settingGroup}>
                    <Field label="Key size">
                        <Slider
                            value={keySize}
                            onChange={(ev, data) => setKeySize(data.value)}
                            min={MIN_KEY_SIZE}
                            max={MAX_KEY_SIZE}
                            step={1}
                        />
                    </Field>
                    {/* <Switch
                        disabled
                        label={
                            <InfoLabel info="Add a new entry to map when all keys in the current one are assigned.">
                                Auto add
                            </InfoLabel>
                        }
                        checked={autoAdd}
                        onChange={(ev, data) => setAutoAdd(data.checked)}
                    /> */}
                </div>
            </div>
        </div>
    );
};

interface PositionMapHeaderProps {
    layouts: PhysicalLayout[];
    positionMap: PositionMap;
}

const PositionMapHeader: React.FC<PositionMapHeaderProps> = ({ layouts, positionMap }) => {
    const classes = useStyles();

    return (
        <tr>
            {positionMap.children.map((item) => {
                const layout = findLayout(layouts, item.physicalLayout);

                return (
                    <th key={item.path} className={classes.mapListHeaderCell}>
                        {layout?.displayName ?? '&' + item.physicalLayout}
                    </th>
                );
            })}
            <th className={mergeClasses(classes.mapListHeaderCell, classes.mapListHeaderSpacer)} />
        </tr>
    );
};

interface PositionMapRowProps extends HTMLAttributes<HTMLTableRowElement> {
    index: number;
    positionMap: PositionMap;
    colorScale: ColorScale;

    selected: boolean;

    onDelete?: (index: number) => void;
}

const PositionMapRow: React.FC<PositionMapRowProps> = ({
    index,
    positionMap,
    colorScale,
    selected,
    onDelete,
    className,
    ...props
}) => {
    const classes = useStyles();

    const handleClick: MouseEventHandler = (ev) => {
        ev.stopPropagation();
        onDelete?.(index);
    };

    return (
        <tr className={mergeClasses(className, classes.mapListRow, selected && classes.selected)} {...props}>
            {positionMap.children.map((item, i) => {
                const keyIndex = item.positions[index];

                return (
                    <td key={i}>
                        <Key className={classes.key} color={keyIndex === undefined ? undefined : colorScale(index)}>
                            {keyIndex ?? '__'}
                        </Key>
                    </td>
                );
            })}

            <td>
                <Button icon={<DeleteRegular />} onClick={handleClick} />
            </td>
        </tr>
    );
};

const useStyles = makeStyles({
    root: {
        display: 'grid',
        gridTemplate: 'auto / fit-content(800px) max-content max-content',
        width: 'max-content',
        height: 'calc(100vh - 44px)',

        marginLeft: 'auto',
        marginRight: 'auto',
    },
    error: {
        marginTop: tokens.spacingVerticalM,
    },
    list: {
        overflowX: 'hidden',
        overflowY: 'auto',
        scrollbarGutter: 'stable',
    },
    layoutList: {
        display: 'flex',
        flexFlow: 'row wrap',
        columnGap: tokens.spacingHorizontalXXXL,
        rowGap: tokens.spacingVerticalXXL,
        alignItems: 'start',
        justifyContent: 'center',
        ...shorthands.padding(tokens.spacingVerticalM, '48px'),
    },

    mapList: {
        ...shorthands.padding(0, tokens.spacingHorizontalXL),
    },

    settingsList: {
        ...shorthands.padding(0, tokens.spacingHorizontalXL),

        '& h3': {
            marginTop: tokens.spacingVerticalXXL,
            marginBottom: tokens.spacingVerticalS,
            ...typographyStyles.subtitle2,
        },

        '& h3:first-child': {
            marginTop: tokens.spacingVerticalM,
        },
    },

    settingGroup: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalM,
    },

    mapTable: {
        borderSpacing: `0 ${tokens.spacingVerticalXS}`,
        // Undo the border spacing at the top so the sticky header doesn't move.
        marginTop: `calc(${tokens.spacingVerticalXS} * -1)`,
    },

    sticky: {
        position: 'sticky',
        backgroundColor: tokens.colorNeutralBackground2,
    },

    mapListHeader: {
        top: 0,

        // Hide the 2px outline of selected/hovered rows.
        outline: `2px solid ${tokens.colorNeutralBackground2}`,
    },
    mapListHeaderCell: {
        boxSizing: 'border-box',
        writingMode: 'vertical-lr',
        textAlign: 'end',
        width: '37px',
        maxHeight: '160px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',

        ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalXS, tokens.spacingVerticalS, '1px'),
        ...typographyStyles.subtitle2,
    },
    mapListHeaderSpacer: {
        width: '45px',
    },

    mapListFooter: {
        bottom: 0,

        // Hide the 2px outline of selected/hovered rows.
        marginLeft: '-2px',
        marginRight: '-2px',

        paddingTop: tokens.spacingVerticalS,
        paddingBottom: tokens.spacingVerticalM,

        textAlign: 'center',
    },
    mapListRow: {
        borderRadius: tokens.borderRadiusMedium,

        '& td': {
            padding: '1px',
        },

        '& td:not(:last-child)': {
            paddingRight: tokens.spacingHorizontalXS,
        },

        '& td:last-child': {
            paddingLeft: tokens.spacingHorizontalM,
        },

        ':hover': {
            backgroundColor: KEY_HOVER_COLOR,
            outline: `2px solid ${KEY_HOVER_COLOR}`,
        },
    },
    key: {
        width: '32px',
        height: '32px',
        border: `1px solid ${tokens.colorNeutralBackground2}`,
    },
    selected: {
        backgroundColor: KEY_SELECTED_COLOR,
        outline: `2px solid ${KEY_SELECTED_COLOR}`,
    },
});

function useConfirmReset() {
    return useAsyncModal((resolve, props) => {
        return <ResetPositionMapPrompt resolve={resolve} {...props} />;
    });
}

function findPositionMap(positionMap: PositionMap, layoutLabel: string) {
    return positionMap.children.find((item) => item.physicalLayout === layoutLabel);
}

function findLayout(layouts: PhysicalLayout[], layoutLabel: string) {
    return layouts.find((item) => item.label === layoutLabel);
}

function assignPositionMapKey(
    positionMap: PositionMap,
    layout: string,
    mapIndex: number,
    keyIndex: number,
): PositionMap {
    return {
        ...positionMap,
        children: positionMap.children.map((item) => {
            if (item.physicalLayout !== layout) {
                return item;
            }

            const resized = [...item.positions];
            while (resized.length <= mapIndex) {
                resized.push(undefined);
            }

            const positions = resized.map((key, i) => {
                if (i === mapIndex) {
                    return keyIndex === key ? undefined : keyIndex;
                }

                if (key === keyIndex) {
                    return resized[mapIndex];
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

function removePositionMapIndex(positionMap: PositionMap, index: number): PositionMap {
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

function resetPositionMap(positionMap: PositionMap): PositionMap {
    return {
        ...positionMap,
        children: positionMap.children.map((item) => {
            return {
                ...item,
                positions: [],
            };
        }),
    };
}
