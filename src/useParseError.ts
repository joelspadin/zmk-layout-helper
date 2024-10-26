import { useContext } from 'react';
import { ParseErrorContext } from './context';

/**
 * Gets any error that occurred during parsing of the import code.
 */
export function useParseError(): Error | undefined {
    return useContext(ParseErrorContext);
}
