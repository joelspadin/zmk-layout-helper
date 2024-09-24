import { useContext } from 'react';
import { ParseErrorContext } from './context';
import { ParseError } from './parser/devicetree';

/**
 * Gets any error that occurred during parsing of the import code.
 */
export function useParseError(): ParseError | undefined {
    return useContext(ParseErrorContext);
}
