import { useContext } from 'react';
import { ImportCodeContext, ImportCodeState } from './context';

/**
 * Gets the code entered into the import page.
 */
export function useImportCode(): ImportCodeState {
    return useContext(ImportCodeContext);
}
