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

  return (
    <div className={classes.root}>
      <Field label="Paste .dts/.overlay here">
        <Textarea
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
  },
  textarea: {
    width: "800px",
    maxWidth: "calc(100vw - 48px)",
    height: "calc(100vh - 44px - 24px - 16px)",
    maxHeight: "unset",
    fontFamily: tokens.fontFamilyMonospace,
  },
});
