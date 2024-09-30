import { PropsWithChildren, useCallback, useState } from 'react';
import { DEFAULT_EDIT_STATE, EditStateContext, ImportCodeContext, ParseErrorContext, ParserContext } from './context';
import { getParser, ParseError } from './parser/devicetree';
import { LayoutParseResult, parseLayouts } from './parser/layout';
import { getNodeRange } from './parser/position';
import { EditState, PhysicalLayout, PositionMap } from './types';
import { use, wrapPromise } from './use';
import { getMinKeyCount } from './utility';

const parserPromise = wrapPromise(getParser());

interface ParseResult {
    parsed?: LayoutParseResult;
    error?: ParseError;
}

export type ContextProvidersProps = PropsWithChildren;

/**
 * Manages the application state that should be consistent between tabs.
 */
export const ContextProviders: React.FC<ContextProvidersProps> = ({ children }) => {
    const parser = use(parserPromise);
    const [code, setCode] = useState<string>('');

    // TODO: add undo/redo for state changes
    const [state, setState] = useState<EditState>(DEFAULT_EDIT_STATE);
    const [{ parsed, error }, setResult] = useState<ParseResult>({});

    const parseCode = useCallback(() => {
        try {
            const parsed = parseLayouts(parser, code);
            setResult({ parsed });
        } catch (ex) {
            if (ex instanceof ParseError) {
                console.error(getNodeRange(code, ex.node).toString(), ex.message);
                setResult({ error: ex });
            }

            throw ex;
        }
    }, [parser, code, setResult]);

    const [prevMap, setPrevMap] = useState<PositionMap>();
    const [prevLayouts, setPrevLayouts] = useState<PhysicalLayout[]>();
    if (parsed && (parsed.positionMap !== prevMap || parsed.layouts !== prevLayouts)) {
        setPrevMap(parsed.positionMap);
        setPrevLayouts(parsed.layouts);
        setState(makeInitialState(parsed.layouts, parsed.positionMap));
    }

    return (
        <ParserContext.Provider value={parser}>
            <ImportCodeContext.Provider value={[code, setCode, parseCode]}>
                <EditStateContext.Provider value={[state, setState]}>
                    <ParseErrorContext.Provider value={error}>{children}</ParseErrorContext.Provider>
                </EditStateContext.Provider>
            </ImportCodeContext.Provider>
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

    const keyCount = getMinKeyCount(newLayouts, newMap);

    return {
        layouts: newLayouts,
        positionMap: newMap,
        keyCount,
    };
}
