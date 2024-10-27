import { cpp } from '@codemirror/lang-cpp';
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
import { tags as t } from '@lezer/highlight';
import { githubDarkInit } from '@uiw/codemirror-theme-github';
import CodeMirror, { BasicSetupOptions, Extension } from '@uiw/react-codemirror';
import React, { useCallback } from 'react';
import { ImportPrompt } from './ImportPrompt';
import { ParseError } from './parser/error';
import { ImportFormat } from './types';
import { useAsyncModal } from './useAsyncModal';
import { useEditState } from './useEditState';
import { useImportState } from './useImportState';
import { useParseError } from './useParseError';
import { capitalize } from './utility';

const DROP_FILE_TYPES = ['.json', '.dts', '.dtsi', '.keymap', '.overlay'];

const githubDark = githubDarkInit({
    settings: {
        gutterBackground: '#0d1117',
        gutterForeground: tokens.colorNeutralForegroundDisabled,
        lineHighlight: '#6882a91f',
    },
    styles: [
        { tag: t.name, color: '#ffa657' },
        { tag: t.typeName, color: '#d2a8ff' },
        { tag: t.processingInstruction, color: '#ff7b72' },
    ],
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

    const handleDrop: React.DragEventHandler = useCallback(
        async (ev) => {
            ev.preventDefault();

            const file = ev.dataTransfer.items[0]?.getAsFile();
            if (file && DROP_FILE_TYPES.some((ext) => file.name.endsWith(ext))) {
                const text = await file.text();
                setCode((prev) => (prev ? prev + '\n' + text : text));
            }
        },
        [setCode],
    );

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
                                    {Object.entries(FORMAT_DATA).map((item) => {
                                        const [key, value] = item;
                                        return (
                                            <option key={key} value={key}>
                                                {capitalize(value.name)}
                                            </option>
                                        );
                                    })}
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
                        placeholder={`Paste ${formatData.name} data or drag and drop files here`}
                        extensions={formatData.extensions}
                        basicSetup={{
                            lineNumbers: true,
                            foldGutter: false,
                            dropCursor: false,
                            ...formatData.options,
                        }}
                        onDropCapture={handleDrop}
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
    // TODO: replace cpp() with devicetree parser
    devicetree: { name: 'devicetree', options: { tabSize: 4 }, extensions: [cpp()] },
    kle: {
        name: 'KLE JSON',
        options: { tabSize: 2 },
        extensions: [json()],
        note:
            'Use the output from "Download JSON", not the raw data. ' +
            'To import multiple layouts, paste multiple files end-to-end below.',
    },
    qmk: {
        name: 'QMK JSON',
        options: { tabSize: 4 },
        extensions: [json()],
    },
};

function useConfirmImport() {
    return useAsyncModal((resolve, props) => {
        return <ImportPrompt resolve={resolve} {...props} />;
    });
}
