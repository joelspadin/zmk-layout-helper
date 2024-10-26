import { useContext } from 'react';
import { ImportCodeContext } from './context';
import { ImportState } from './types';

/**
 * Gets the import page's settings.
 */
export function useImportState(): ImportState {
    return useContext(ImportCodeContext);
}
