import {
  Field,
  makeStyles,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import { useMemo } from "react";
import { ParseError } from "./parser/devicetree";
import { parseLayouts } from "./parser/layout";
import { getNodeRange } from "./parser/position";
import { useDeviceTree } from "./useDeviceTree";
import { useParser } from "./useParser";

export const DeviceTreePage: React.FC = () => {
  const classes = useStyles();
  const parser = useParser();
  const [devicetree, setDevicetree] = useDeviceTree();

  useMemo(() => {
    try {
      const result = parseLayouts(parser, devicetree);
      console.log(result);
      return result;
    } catch (ex) {
      if (ex instanceof ParseError) {
        console.error(getNodeRange(devicetree, ex.node).toString(), ex.message);
      } else {
        throw ex;
      }
    }
  }, [parser, devicetree]);

  return (
    <div className={classes.root}>
      <Field label="Paste .dts/.overlay here">
        <Textarea
          textarea={{ className: classes.textarea }}
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
  },
  textarea: {
    width: "800px",
    height: "calc(100vh - 48px - 24px - 16px)",
    maxHeight: "unset",
    fontFamily: tokens.fontFamilyMonospace,
  },
});
