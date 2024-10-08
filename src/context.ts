import { createContext, Dispatch, SetStateAction } from 'react';
import Parser from 'web-tree-sitter';
import { ParseError } from './parser/devicetree';
import { EditState } from './types';

export const ParserContext = createContext<Parser | undefined>(undefined);

export type ImportCodeState = [string, Dispatch<SetStateAction<string>>, () => void];

export const ImportCodeContext = createContext<ImportCodeState>(['', () => {}, () => {}]);

export type EditStateState = [EditState, Dispatch<SetStateAction<EditState>>];

export const DEFAULT_EDIT_STATE: EditState = {
    layouts: [],
    positionMap: {
        path: '',
        label: '',
        complete: false,
        children: [],
    },
    keyCount: 0,
};

export const EditStateContext = createContext<EditStateState>([DEFAULT_EDIT_STATE, () => {}]);

export const ParseErrorContext = createContext<ParseError | undefined>(undefined);
