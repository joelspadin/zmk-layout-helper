import { createContext, Dispatch, SetStateAction } from 'react';
import Parser from 'web-tree-sitter';
import { EditState, ImportState } from './types';

export const ParserContext = createContext<Parser | undefined>(undefined);

const STUB_IMPORT_STATE: ImportState = {
    format: 'devicetree',
    setFormat: () => {},
    code: '',
    setCode: () => {},
    importCode: () => {},
};

export const ImportCodeContext = createContext<ImportState>(STUB_IMPORT_STATE);

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

export const ParseErrorContext = createContext<Error | undefined>(undefined);
