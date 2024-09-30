import { makeStyles, mergeClasses } from '@fluentui/react-components';
import { HTMLAttributes, useMemo } from 'react';

export interface LineNumbersProps extends HTMLAttributes<HTMLDivElement> {
    code: string;
    lineNumberClassName?: string;
}

export const LineNumbers: React.FC<LineNumbersProps> = ({ code, lineNumberClassName, ...props }) => {
    const classes = useStyles();

    const lineNumbers = useMemo(() => {
        const lineCount = (code.match(/\n/g) ?? []).length + 1;
        return [...Array(lineCount).keys()].map((k) => k + 1);
    }, [code]);

    return (
        <div {...props}>
            {lineNumbers.map((i) => (
                <div key={i} className={mergeClasses(classes.line, lineNumberClassName)}>
                    {i}
                </div>
            ))}
        </div>
    );
};

const useStyles = makeStyles({
    line: {
        userSelect: 'none',
    },
});
