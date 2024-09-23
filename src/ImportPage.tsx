import {
  Field,
  makeStyles,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import { useDeviceTree } from "./useDeviceTree";

export const ImportPage: React.FC = () => {
  const classes = useStyles();
  const [devicetree, setDevicetree] = useDeviceTree();

  // TODO: highlight this and show where errors occurred.

  return (
    <div className={classes.root}>
      <Field label="Paste .dts/.overlay here">
        <Textarea
          root={{ className: classes.wrapper }}
          textarea={{
            className: classes.textarea,
            autoComplete: "off",
            autoCorrect: "off",
            autoCapitalize: "off",
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
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
    marginTop: tokens.spacingVerticalM,
  },
  wrapper: {
    backgroundColor: tokens.colorNeutralBackground3,
    overflow: "hidden",
  },
  textarea: {
    width: "800px",
    maxWidth: "calc(100vw - 48px)",
    height: `calc(100vh - 48px - 26px - ${tokens.spacingVerticalM} * 2)`,
    maxHeight: "unset",
    fontFamily: tokens.fontFamilyMonospace,
  },
});
