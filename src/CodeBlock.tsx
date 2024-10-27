import { Button, makeStyles, mergeClasses, shorthands, tokens, Tooltip, useTimeout } from '@fluentui/react-components';
import { HTMLAttributes, useCallback, useMemo, useState } from 'react';

import { bundleIcon, CheckmarkFilled, CopyFilled, CopyRegular, FluentIconsProps } from '@fluentui/react-icons';
import { highlight } from './highlight';

const Copy = bundleIcon(CopyFilled, CopyRegular);

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
    children?: string;
    language?: string;
}

/**
 * Displays a code block with syntax highlighting and a copy button.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({ children, language, className, ...props }) => {
    children ??= '';
    language ??= 'dts';

    const classes = useStyles();

    const [copied, setCopied] = useState(false);
    const [setTimeout] = useTimeout();

    const highlighted = useMemo(() => highlight(children, { language }).value, [children, language]);

    const copyCode = useCallback(() => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [children, setCopied, setTimeout]);

    return (
        <pre className={mergeClasses(classes.pre, className)}>
            <code
                className={mergeClasses('hljs', classes.code)}
                dangerouslySetInnerHTML={{ __html: highlighted }}
                {...props}
            />
            <Tooltip content="Copy" relationship="label" withArrow>
                <Button
                    size="large"
                    appearance="subtle"
                    className={classes.copyButton}
                    icon={<CopyIcon copied={copied} />}
                    onClick={copyCode}
                />
            </Tooltip>
        </pre>
    );
};

interface CopyIconProps extends FluentIconsProps {
    copied: boolean;
}

const CopyIcon: React.FC<CopyIconProps> = ({ copied, ...props }) => {
    const classes = useStyles();

    return (
        <span className={classes.iconWrapper}>
            <CheckmarkFilled
                className={mergeClasses(classes.icon, classes.checkmark, !copied && classes.hidden)}
                {...props}
            />
            <Copy className={mergeClasses(classes.icon, copied && classes.hidden)} {...props} />
        </span>
    );
};

const useStyles = makeStyles({
    pre: {
        display: 'block',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,

        borderRadius: tokens.borderRadiusMedium,
        boxShadow: tokens.shadow4,
    },
    code: {
        display: 'block',
        boxSizing: 'border-box',
        overflow: 'auto',
        margin: 0,
        ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),

        fontFamily: tokens.fontFamilyMonospace,
        scrollbarColor: `${tokens.colorNeutralForeground3} ${tokens.colorNeutralBackground3}`,
    },
    copyButton: {
        position: 'absolute',
        top: tokens.spacingVerticalS,
        right: tokens.spacingHorizontalS,
    },
    checkmark: {
        color: tokens.colorPaletteLightGreenForeground1,
    },
    iconWrapper: {
        position: 'relative',
        width: '24px',
        height: '24px',
    },
    icon: {
        position: 'absolute',
        top: 0,
        left: 0,
        transitionProperty: 'transform',
        transitionDuration: tokens.durationSlower,
        transitionTimingFunction: tokens.curveEasyEaseMax,
    },
    hidden: {
        transform: 'scale(0)',
    },
});
