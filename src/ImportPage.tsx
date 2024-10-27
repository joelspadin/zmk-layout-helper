import { json } from '@codemirror/lang-json';
import {
    Button,
    Field,
    makeStyles,
    MessageBar,
    MessageBarBody,
    Select,
    tokens,
    useFocusableGroup,
    useUncontrolledFocus,
} from '@fluentui/react-components';
import { ArrowImportRegular } from '@fluentui/react-icons';
import { githubDarkInit } from '@uiw/codemirror-theme-github';
import CodeMirror, { BasicSetupOptions, Extension } from '@uiw/react-codemirror';
import { useCallback } from 'react';
import { ImportPrompt } from './ImportPrompt';
import { ParseError } from './parser/error';
import { ImportFormat } from './types';
import { useAsyncModal } from './useAsyncModal';
import { useEditState } from './useEditState';
import { useImportState } from './useImportState';
import { useParseError } from './useParseError';

const githubDark = githubDarkInit({
    settings: {
        gutterBackground: '#0d1117',
        gutterForeground: tokens.colorNeutralForegroundDisabled,
        lineHighlight: '#6882a91f',
    },
});

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
                <div className={classes.editorBorder} {...focusGroup}>
                    <CodeMirror
                        className={classes.editor}
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme={githubDark}
                        placeholder={`Paste ${formatData.name} data here`}
                        extensions={formatData.extensions}
                        basicSetup={{
                            lineNumbers: true,
                            foldGutter: false,
                            ...formatData.options,
                        }}
                        {...uncontrolledFocus}
                    />
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
    editorBorder: {
        display: 'flex',
        overflow: 'hidden',
        borderRadius: tokens.borderRadiusMedium,
        boxShadow: tokens.shadow4,
    },
    editor: {
        width: '100%',

        '& .cm-editor': {
            height: '100%',

            scrollbarColor: `${tokens.colorNeutralForeground3} #0d1117`,
        },

        '& .cm-scroller': {
            fontFamily: tokens.fontFamilyMonospace,
        },

        '& .cm-content': {
            paddingTop: tokens.spacingVerticalM,
            paddingBottom: tokens.spacingVerticalM,
        },

        '& .cm-line': {
            paddingLeft: tokens.spacingHorizontalM,
            paddingRight: tokens.spacingHorizontalM,
        },

        '& .cm-gutter': {
            paddingLeft: tokens.spacingHorizontalM,
        },

        '& .cm-activeLineGutter': {
            marginLeft: `calc(-1 * ${tokens.spacingHorizontalM})`,
        },
    },
});

interface FormatData {
    name: string;
    options: BasicSetupOptions;
    note?: string;
    extensions: Extension[];
}

const FORMAT_DATA: Record<ImportFormat, FormatData> = {
    devicetree: { name: 'devicetree', options: { tabSize: 4 }, extensions: [] },
    kle: {
        name: 'KLE',
        options: { tabSize: 2 },
        extensions: [json()],
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
