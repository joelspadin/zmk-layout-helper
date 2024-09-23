import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import hljs from "highlight.js";
import dts from "highlight.js/lib/languages/dts";
import "highlight.js/styles/github-dark.css";
import { useMemo } from "react";
import { formatLayout } from "./formatter/layout";
import { useEditState } from "./useEditState";

hljs.registerLanguage("dts", dts);

export const ExportPage: React.FC = () => {
  const classes = useStyles();
  const [state] = useEditState();

  const devicetree = useMemo(() => formatLayout(state), [state]);

  const highlighted = useMemo(
    () => hljs.highlight(devicetree, { language: "dts" }).value,
    [devicetree]
  );

  // TODO: add a copy button
  // TODO: add download button
  // TODO: warn if some positions are undefined

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <pre className={mergeClasses("hljs", classes.textarea)}>
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
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
    overflow: "hidden",
    borderRadius: tokens.borderRadiusMedium,
    scrollbarColor: `${tokens.colorNeutralForeground3} ${tokens.colorNeutralBackground3}`,
    boxShadow: tokens.shadow4,
  },
  textarea: {
    boxSizing: "border-box",

    width: "800px",
    maxWidth: "calc(100vw - 48px)",
    height: `calc(100vh - 48px - ${tokens.spacingVerticalM} * 2)`,
    maxHeight: "unset",
    overflow: "auto",

    margin: 0,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),

    fontFamily: tokens.fontFamilyMonospace,
  },
});
