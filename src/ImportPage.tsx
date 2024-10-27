import {
    Button,
    Field,
    makeStyles,
    mergeClasses,
    MessageBar,
    MessageBarBody,
    Select,
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
import { ParseError } from './parser/error';
import { ImportFormat } from './types';
import { useAsyncModal } from './useAsyncModal';
import { useEditState } from './useEditState';
import { useImportState } from './useImportState';
import { useParseError } from './useParseError';

export interface ImportPageProps {
    onImport?: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onImport }) => {
    const classes = useStyles();
    const error = useParseError();
    const { format, setFormat, code, setCode, importCode } = useImportState();
    const [state] = useEditState();
    const [confirmImport, renderConfirmModal] = useConfirmImport();

    // Make sure pressing tab inside the editor inserts whitespace instead of moving focus.
    const focusGroup = useFocusableGroup({ tabBehavior: 'limited-trap-focus' });
    const uncontrolledFocus = useUncontrolledFocus();

    const handleImport = useCallback(async () => {
        if (state.layouts.length === 0 || (await confirmImport())) {
            importCode();
            onImport?.();
        }
    }, [state.layouts.length, confirmImport, importCode, onImport]);

    const formatData = FORMAT_DATA[format];

    // TODO: highlight where errors occurred.
    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <div className={classes.header}>
                    <div className={classes.topRow}>
                        <div>
                            <Field label="Format" orientation="horizontal">
                                <Select
                                    value={format}
                                    appearance="underline"
                                    onChange={(ev, data) => setFormat(data.value as ImportFormat)}
                                >
                                    <option value="devicetree">Devicetree</option>
                                    <option value="kle">KLE JSON</option>
                                </Select>
                            </Field>
                        </div>

                        <Button
                            appearance="primary"
                            disabled={!code}
                            icon={<ArrowImportRegular />}
                            onClick={handleImport}
                        >
                            Import {formatData.name}
                        </Button>

                        {renderConfirmModal()}
                    </div>
                    {formatData.note && <div className={classes.note}>{formatData.note}</div>}
                    {error && (
                        <MessageBar intent="error">
                            <MessageBarBody>
                                {error instanceof ParseError && `Line ${error.startPosition.row + 1}: `}
                                {error.message}
                            </MessageBarBody>
                        </MessageBar>
                    )}
                </div>
                <div className={classes.editor} {...focusGroup}>
                    <div className={classes.editorScroll}>
                        <div className={classes.editorWrapper}>
                            <LineNumbers code={code} className={mergeClasses('hljs', classes.lineNumbers)} />
                            <Editor
                                className="hljs"
                                value={code}
                                onValueChange={setCode}
                                highlight={(code) => highlight(code, { language: formatData.language }).value}
                                padding={12}
                                tabSize={4}
                                placeholder={`Paste ${formatData.name} data here`}
                                {...uncontrolledFocus}
                            />
                        </div>
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
            "header" max-content
            "code" auto / auto
        `,

        width: '800px',
        maxWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 48px)',
        paddingTop: tokens.spacingVerticalM,
        paddingBottom: tokens.spacingVerticalM,
        boxSizing: 'border-box',
    },
    header: {
        gridArea: 'header',
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalM,

        marginBottom: tokens.spacingVerticalM,
    },
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    note: {
        color: tokens.colorNeutralForeground2,
    },
    editor: {
        overflow: 'hidden',
        borderRadius: tokens.borderRadiusMedium,
        boxShadow: tokens.shadow4,

        boxSizing: 'border-box',

        fontFamily: tokens.fontFamilyMonospace,

        '& textarea': {
            outline: 'none',
        },
    },
    editorScroll: {
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',

        backgroundColor: tokens.colorNeutralBackground3,
        scrollbarColor: `${tokens.colorNeutralForeground3} ${tokens.colorNeutralBackground3}`,
    },
    editorWrapper: {
        display: 'grid',
        gridTemplate: 'auto / max-content auto',
    },
    lineNumbers: {
        ...shorthands.padding('12px', tokens.spacingHorizontalS, '12px', tokens.spacingHorizontalL),
        color: tokens.colorNeutralForegroundDisabled,
    },
});

interface FormatData {
    name: string;
    language: string;
    note?: string;
}

const FORMAT_DATA: Record<ImportFormat, FormatData> = {
    devicetree: { name: 'devicetree', language: 'dts' },
    kle: {
        name: 'KLE',
        language: 'json',
        note:
            'Use the output from "Download JSON", not the raw data. ' +
            'To import multiple layouts, paste multiple files end-to-end below.',
    },
};

function useConfirmImport() {
    return useAsyncModal((resolve, props) => {
        return <ImportPrompt resolve={resolve} {...props} />;
    });
}
