import { Field, makeStyles, Textarea, tokens } from '@fluentui/react-components';
import { useImportCode } from './useImportCode';

export const ImportPage: React.FC = () => {
    const classes = useStyles();
    const [devicetree, setDevicetree] = useImportCode();

    // TODO: add a format selector? (devicetree/KLE JSON/QMK JSON)
    // TODO: highlight the text input and show where errors occurred.

    return (
        <div className={classes.root}>
            <Field label="Paste .dts/.overlay here">
                <Textarea
                    root={{ className: classes.wrapper }}
                    textarea={{
                        className: classes.textarea,
                        autoComplete: 'off',
                        autoCorrect: 'off',
                        autoCapitalize: 'off',
                        spellCheck: false,
                    }}
                    value={devicetree}
                    onChange={(ev, data) => setDevicetree(data.value)}
                />
            </Field>
        </div>
    );
};

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        marginTop: tokens.spacingVerticalM,
    },
    wrapper: {
        backgroundColor: tokens.colorNeutralBackground3,
        overflow: 'hidden',
    },
    textarea: {
        width: '800px',
        maxWidth: 'calc(100vw - 48px)',
        height: `calc(100vh - 48px - 26px - ${tokens.spacingVerticalM} * 2)`,
        maxHeight: 'unset',
        fontFamily: tokens.fontFamilyMonospace,
    },
});
