import {
    Button,
    makeStyles,
    mergeClasses,
    tokens,
    useFocusableGroup,
    useUncontrolledFocus,
} from '@fluentui/react-components';
import { ArrowImportRegular } from '@fluentui/react-icons';
import { useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight } from './highlight';
import { ImportPrompt } from './ImportPrompt';
import { useAsyncModal } from './useAsyncModal';
import { useEditState } from './useEditState';
import { useImportCode } from './useImportCode';

export interface ImportPageProps {
    onImport?: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onImport }) => {
    const classes = useStyles();
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
                <div className={classes.editorBorder}>
                    <div className={classes.editorWrapper} {...focusGroup}>
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
        marginTop: tokens.spacingVerticalM,
    },
    content: {
        width: '800px',
        maxWidth: 'calc(100vw - 48px)',
    },
    actions: {
        display: 'flex',
        justifyContent: 'end',
        marginBottom: tokens.spacingVerticalM,
    },
    editorBorder: {
        borderRadius: tokens.borderRadiusMedium,
        overflow: 'hidden',
    },
    editorWrapper: {
        '--editor-height': `calc(100vh - 48px - 32px - ${tokens.spacingVerticalM} * 3)`,

        position: 'relative',
        maxHeight: 'var(--editor-height)',
        overflow: 'auto',

        backgroundColor: tokens.colorNeutralBackground3,
        scrollbarColor: `${tokens.colorNeutralForeground3} ${tokens.colorNeutralBackground3}`,
    },
    editor: {
        minHeight: 'var(--editor-height)',
        fontFamily: tokens.fontFamilyMonospace,

        '& textarea': {
            outline: 0,
        },
    },
    placeholder: {
        position: 'absolute',
        top: tokens.spacingVerticalM,
        left: 0,
        right: 0,
        textAlign: 'center',
    },
});

function useConfirmImport() {
    return useAsyncModal((resolve, props) => {
        return <ImportPrompt resolve={resolve} {...props} />;
    });
}
