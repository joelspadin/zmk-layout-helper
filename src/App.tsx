import {
  FluentProvider,
  makeStaticStyles,
  makeStyles,
  Spinner,
  tokens,
  webDarkTheme,
} from "@fluentui/react-components";
import { Suspense } from "react";
import { MainPage } from "./MainPage";

export const App: React.FC = () => {
  useStaticStyles();

  const classes = useStyles();

  return (
    <FluentProvider theme={webDarkTheme} className={classes.root}>
      <Suspense fallback={<Spinner />}>
        <MainPage />
      </Suspense>
    </FluentProvider>
  );
};

const useStaticStyles = makeStaticStyles({
  body: {
    padding: 0,
    margin: 0,
  },
});

const useStyles = makeStyles({
  root: {
    colorScheme: "dark",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colorNeutralBackground2,
  },
});
