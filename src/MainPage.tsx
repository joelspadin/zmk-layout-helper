import { Tab, TabList, TabValue, makeStyles } from "@fluentui/react-components";
import { useState } from "react";
import { DeviceTreeContext, ParserContext } from "./context";
import { DeviceTreePage } from "./DeviceTreePage";
import { getParser } from "./parser/devicetree";
import { use, wrapPromise } from "./use";

const parserPromise = wrapPromise(getParser());

export const MainPage: React.FC = () => {
  const classes = useStyles();
  const parser = use(parserPromise);

  const [devicetree, setDevicetree] = useState<string>("");
  const [tab, setTab] = useState<TabValue>("devicetree");

  return (
    <ParserContext.Provider value={parser}>
      <DeviceTreeContext.Provider value={[devicetree, setDevicetree]}>
        <TabList
          selectedValue={tab}
          onTabSelect={(ev, data) => setTab(data.value)}
          className={classes.tabs}
        >
          <Tab value="devicetree">Devicetree</Tab>
          <Tab value="positions">Position Map</Tab>
        </TabList>

        {tab === "devicetree" && <DeviceTreePage />}
      </DeviceTreeContext.Provider>
    </ParserContext.Provider>
  );
};

const useStyles = makeStyles({
  tabs: {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "center",
  },
});
