import { PropsWithChildren, useMemo, useState } from 'react';
import { DEFAULT_EDIT_STATE, DeviceTreeContext, EditStateContext, ParseErrorContext, ParserContext } from './context';
import { getParser, ParseError } from './parser/devicetree';
import { parseLayouts } from './parser/layout';
import { getNodeRange } from './parser/position';
import { EditState, PhysicalLayout, PositionMap } from './types';
import { use, wrapPromise } from './use';

const parserPromise = wrapPromise(getParser());

export type ContextProvidersProps = PropsWithChildren;

export const ContextProviders: React.FC<ContextProvidersProps> = ({ children }) => {
    const parser = use(parserPromise);
    const [devicetree, setDevicetree] = useState<string>('');

    // TODO: add undo/redo for state changes
    const [state, setState] = useState<EditState>(DEFAULT_EDIT_STATE);

    const [parsed, error] = useMemo(() => {
        try {
            const parsed = parseLayouts(parser, devicetree);

            return [parsed, undefined];
        } catch (ex) {
            if (ex instanceof ParseError) {
                console.error(getNodeRange(devicetree, ex.node).toString(), ex.message);
                return [undefined, ex];
            }

            throw ex;
        }
    }, [parser, devicetree]);

    const [prevMap, setPrevMap] = useState<PositionMap>();
    const [prevLayouts, setPrevLayouts] = useState<PhysicalLayout[]>();
    if (parsed && (parsed.positionMap !== prevMap || parsed.layouts !== prevLayouts)) {
        setPrevMap(parsed.positionMap);
        setPrevLayouts(parsed.layouts);
        setState(makeInitialState(parsed.layouts, parsed.positionMap));
    }

    return (
        <ParserContext.Provider value={parser}>
            <DeviceTreeContext.Provider value={[devicetree, setDevicetree]}>
                <EditStateContext.Provider value={[state, setState]}>
                    <ParseErrorContext.Provider value={error}>{children}</ParseErrorContext.Provider>
                </EditStateContext.Provider>
            </DeviceTreeContext.Provider>
        </ParserContext.Provider>
    );
};

function makeInitialState(layouts: PhysicalLayout[] | undefined, positionMap: PositionMap | undefined): EditState {
    layouts ??= [];

    // Layouts must have labels
    const newLayouts = layouts.map((layout, i) => {
        return {
            ...layout,
            label: layout.label || layout.path.split('/').pop() || `layout_${i}`,
        };
    });

    const newMap: PositionMap = {
        path: positionMap?.path ?? '/position_map',
        label: positionMap?.label ?? '',
        complete: positionMap?.complete ?? false,
        children: [],
    };

    // Make sure there is a position map item for every layout, and they are in
    // the same order as the layouts.
    for (const layout of layouts) {
        const existingItem = positionMap?.children.find((map) => map.physicalLayout === layout.label);

        newMap.children.push({
            path: newMap.path + '/' + layout.label,
            label: '',
            physicalLayout: layout.label,
            positions: [],
            ...existingItem,
        });
    }

    const length = newMap.children.reduce((prev, item) => Math.max(prev, item.positions.length), 0);

    return {
        layouts: newLayouts,
        positionMap: newMap,
        length,
    };
}
