import { useContext } from 'react';
import { EditStateContext, EditStateState } from './context';

export function useEditState(): EditStateState {
    return useContext(EditStateContext);
}
