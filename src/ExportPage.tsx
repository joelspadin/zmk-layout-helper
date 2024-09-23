import {
  Field,
  makeStyles,
  SpinButton,
  tokens,
} from "@fluentui/react-components";
import { useMemo, useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { formatLayout } from "./formatter/layout";
import { useEditState } from "./useEditState";

export const ExportPage: React.FC = () => {
  const classes = useStyles();
  const [state] = useEditState();

  // TODO: persist this value
  const [columns, setColumns] = useState(16);

  const devicetree = useMemo(
    () => formatLayout(state, columns),
    [state, columns]
  );

  // TODO: add download button
  // TODO: warn if some positions are undefined

  return (
    <div className={classes.root}>
      <div>
        <div className={classes.settings}>
          <Field label="Position map columns">
            <SpinButton
              appearance="underline"
              value={columns}
              onChange={(ev, data) => data.value && setColumns(data.value)}
              min={1}
              max={25}
              autoComplete="off"
              data-form-type="other"
            />
          </Field>
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
    display: "flex",
    flexFlow: "column",
    alignItems: "center",

    marginTop: tokens.spacingVerticalM,
  },

  settings: {
    display: "flex",
    marginBottom: tokens.spacingVerticalM,
  },

  code: {
    boxSizing: "border-box",
    width: "800px",
    maxWidth: "calc(100vw - 48px)",
    height: `calc(100vh - 48px - 58px - ${tokens.spacingVerticalM} * 3)`,
  },
});
