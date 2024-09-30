import {
    Button,
    makeStyles,
    mergeClasses,
    MessageBar,
    MessageBarBody,
    shorthands,
    tokens,
    useFocusableGroup,
    useUncontrolledFocus,
} from '@fluentui/react-components';
import { ArrowImportRegular } from '@fluentui/react-icons';
import { useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight } from './highlight';
import { ImportPrompt } from './ImportPrompt';
import { LineNumbers } from './LineNumbers';
import { useAsyncModal } from './useAsyncModal';
import { useEditState } from './useEditState';
import { useImportCode } from './useImportCode';
import { useParseError } from './useParseError';

export interface ImportPageProps {
    onImport?: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onImport }) => {
    const classes = useStyles();
    const error = useParseError();
    const [code, setCode, importCode] = useImportCode();
    const [state] = useEditState();

    // TODO: add a format selector? (devicetree/KLE JSON/QMK JSON)
    // TODO: highlight where errors occurred.

    // Make sure pressing tab inside the editor inserts whitespace instead of moving focus.
    const focusGroup = useFocusableGroup({ tabBehavior: 'limited-trap-focus' });
    const uncontrolledFocus = useUncontrolledFocus();

    const [confirmImport, renderConfirmModal] = useConfirmImport();

    const handleImport = useCallback(async () => {
        if (state.layouts.length === 0 || (await confirmImport())) {
            importCode();
            onImport?.();
        }
    }, [state.layouts.length, confirmImport, importCode, onImport]);

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <div className={classes.actions}>
                    <Button appearance="primary" disabled={!code} icon={<ArrowImportRegular />} onClick={handleImport}>
                        Import devicetree
                    </Button>
                    {renderConfirmModal()}
                </div>
                {error && (
                    <MessageBar intent="error" className={classes.error}>
                        <MessageBarBody>
                            Line {error.node.startPosition.row + 1}: {error.message}
                        </MessageBarBody>
                    </MessageBar>
                )}
                <div className={classes.editorBorder}>
                    <div className={classes.editorWrapper} {...focusGroup}>
                        <LineNumbers code={code} className={mergeClasses('hljs', classes.lineNumbers)} />
                        <Editor
                            className={mergeClasses('hljs', classes.editor)}
                            value={code}
                            onValueChange={setCode}
                            highlight={(code) => highlight(code, { language: 'dts' }).value}
                            padding={12}
                            tabSize={4}
                            placeholder="Paste devicetree code here"
                            {...uncontrolledFocus}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const useStyles = makeStyles({
    root: {
        display: 'flex',
        justifyContent: 'center',
    },
    content: {
        display: 'grid',
        gridTemplate: `
            "actions" max-content
            "error" max-content
            "code" auto / auto
        `,
        width: '800px',
        maxWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 48px)',
        paddingTop: tokens.spacingVerticalM,
        paddingBottom: tokens.spacingVerticalM,
        boxSizing: 'border-box',
    },
    actions: {
        gridArea: 'actions',
        display: 'flex',
        justifyContent: 'end',
        marginBottom: tokens.spacingVerticalM,
    },
    error: {
        gridArea: 'error',
        marginBottom: tokens.spacingVerticalM,
    },
    editorBorder: {
        gridArea: 'code',
        overflow: 'hidden',
        borderRadius: tokens.borderRadiusMedium,
        boxShadow: tokens.shadow4,
    },
    editorWrapper: {
        display: 'grid',
        gridTemplate: 'auto / max-content auto',
        position: 'relative',
        height: '100%',
        overflow: 'auto',
        fontFamily: tokens.fontFamilyMonospace,

        backgroundColor: tokens.colorNeutralBackground3,
        scrollbarColor: `${tokens.colorNeutralForeground3} ${tokens.colorNeutralBackground3}`,
    },
    editor: {
        minHeight: '100%',

        '& textarea': {
            outline: 0,
        },
    },
    lineNumbers: {
        ...shorthands.padding('12px', tokens.spacingHorizontalL),
        color: tokens.colorNeutralForegroundDisabled,
    },
});

function useConfirmImport() {
    return useAsyncModal((resolve, props) => {
        return <ImportPrompt resolve={resolve} {...props} />;
    });
}
