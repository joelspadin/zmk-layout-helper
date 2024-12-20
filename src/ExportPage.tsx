import { Field, makeStyles, SpinButton, Switch, tokens } from '@fluentui/react-components';
import { useMemo, useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { formatLayout } from './formatter/layout';
import { useEditState } from './useEditState';
import { useImportState } from './useImportState';
import { useLocalStorage } from './useLocalStorage';

export const ExportPage: React.FC = () => {
    const classes = useStyles();
    const [state] = useEditState();
    const { format } = useImportState();

    const [columns, setColumns] = useLocalStorage('export-columns', 16);
    const [indent, setIndent] = useLocalStorage('export-indent', 4);
    const [includeLayout, setIncludeLayout] = useState(format !== 'devicetree');

    const devicetree = useMemo(
        () => formatLayout(state, { positionMapColumns: columns, includeLayout, indent }),
        [state, includeLayout, columns, indent],
    );

    // TODO: add download button
    // TODO: warn if some positions are undefined

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <div className={classes.settings}>
                    <Field label="Position map columns">
                        <SpinButton
                            className={classes.input}
                            appearance="underline"
                            value={columns}
                            onChange={(ev, data) => data.value && setColumns(data.value)}
                            min={1}
                            max={25}
                            autoComplete="off"
                            data-form-type="other"
                        />
                    </Field>

                    <Field label="Indent size">
                        <SpinButton
                            className={classes.input}
                            appearance="underline"
                            value={indent}
                            onChange={(ev, data) => data.value && setIndent(data.value)}
                            min={2}
                            max={8}
                            autoComplete="off"
                            data-form-type="other"
                        />
                    </Field>

                    <Switch
                        label="Export layouts"
                        labelPosition="above"
                        checked={includeLayout}
                        onChange={(ev, data) => setIncludeLayout(data.checked)}
                    />
                </div>

                <CodeBlock language="dts" className={classes.code}>
                    {devicetree}
                </CodeBlock>
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

    settings: {
        gridArea: 'header',
        display: 'flex',
        marginBottom: tokens.spacingVerticalM,
        gap: tokens.spacingHorizontalM,
    },

    code: {
        gridArea: 'code',
        overflow: 'auto',

        scrollbarColor: `${tokens.colorNeutralForeground3} #0d1117`,
    },

    input: {
        backgroundColor: tokens.colorNeutralBackground2,
        maxWidth: '140px',
    },
});
