import { makeStyles, tokens } from "@fluentui/react-components";
import { useMemo } from "react";
import { CodeBlock } from "./CodeBlock";
import { formatLayout } from "./formatter/layout";
import { useEditState } from "./useEditState";

export const ExportPage: React.FC = () => {
  const classes = useStyles();
  const [state] = useEditState();

  const devicetree = useMemo(() => formatLayout(state), [state]);

  // TODO: add a copy button
  // TODO: add download button
  // TODO: warn if some positions are undefined

  return (
    <div className={classes.root}>
      <CodeBlock language="dts" className={classes.code}>
        {devicetree}
      </CodeBlock>
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

  code: {
    boxSizing: "border-box",
    width: "800px",
    maxWidth: "calc(100vw - 48px)",
    height: `calc(100vh - 48px - ${tokens.spacingVerticalM} * 2)`,
  },
});
