import { useContext } from 'react';
import { ParseErrorContext } from './context';
import { ParseError } from './parser/devicetree';

export function useParseError(): ParseError | undefined {
    return useContext(ParseErrorContext);
}
