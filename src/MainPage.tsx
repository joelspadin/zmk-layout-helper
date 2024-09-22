import {
  Tab,
  TabList,
  TabValue,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useState } from "react";
import { ContextProviders } from "./ContextProviders";
import { ImportPage } from "./ImportPage";
import { PositionMapPage } from "./PositionMapPage";

export const MainPage: React.FC = () => {
  const classes = useStyles();

  const [tab, setTab] = useState<TabValue>("import");

  return (
    <ContextProviders>
      <TabList
        selectedValue={tab}
        onTabSelect={(ev, data) => setTab(data.value)}
        className={classes.tabs}
      >
        <Tab value="import">Import Devicetree</Tab>
        <Tab value="positions">Edit Position Map</Tab>
        <Tab value="export">Export Devicetree</Tab>
      </TabList>

      <div className={classes.content}>
        {tab === "import" && <ImportPage />}
        {tab === "positions" && <PositionMapPage />}
      </div>
    </ContextProviders>
  );
};

const useStyles = makeStyles({
  tabs: {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "center",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  content: {
    height: "calc(100vh - 44px)",
    overflowY: "hidden",
    backgroundColor: tokens.colorNeutralBackground2,
  },
});
