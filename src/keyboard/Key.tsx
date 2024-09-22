import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import chroma from "chroma-js";
import { CSSProperties } from "react";
import { getTextColor, KEY_HOVER_COLOR, KEY_SELECTED_COLOR } from "../colors";

export interface KeyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  color?: chroma.Color;
  selected?: boolean;
  hover?: boolean;
}

export const Key: React.FC<KeyProps> = ({
  color,
  selected,
  hover,
  className,
  style,
  children,
  ...props
}) => {
  const classes = useStyles();

  const colorStyle = getColorStyle(color);

  return (
    <div
      className={mergeClasses(
        classes.key,
        selected && classes.selected,
        hover && classes.hover,
        className
      )}
      style={{ ...colorStyle, ...style }}
      {...props}
    >
      <div className={classes.contents}>{children}</div>
    </div>
  );
};

function getColorStyle(color?: chroma.Color): CSSProperties {
  if (!color) {
    return {};
  }

  const backgroundColor = color.css();

  return {
    backgroundColor,
    color: getTextColor(color),
  };
}

const useStyles = makeStyles({
  key: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",

    backgroundColor: tokens.colorNeutralCardBackground,
    borderRadius: tokens.borderRadiusMedium,

    transitionProperty: "background, color, filter",
    transitionDuration: tokens.durationFaster,
    transitionTimingFunction: tokens.curveEasyEase,

    border: `1px solid transparent`,
  },
  hover: {
    ...shorthands.borderColor(tokens.colorStrokeFocus1),
    outline: `2px solid ${KEY_HOVER_COLOR}`,
  },
  selected: {
    ...shorthands.borderColor(tokens.colorStrokeFocus1),
    outline: `2px solid ${KEY_SELECTED_COLOR}`,
  },
  contents: {
    userSelect: "none",
  },
});
