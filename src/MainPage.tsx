import { Tab, TabList, makeStyles, tokens } from '@fluentui/react-components';
import { useState } from 'react';
import { ContextProviders } from './ContextProviders';
import { ExportPage } from './ExportPage';
import { ImportPage } from './ImportPage';
import { PositionMapPage } from './PositionMapPage';
import { useEditState } from './useEditState';

export const MainPage: React.FC = () => {
    return (
        <ContextProviders>
            <PageContents />
        </ContextProviders>
    );
};

type TabValue = 'import' | 'positions' | 'export';

const PageContents: React.FC = () => {
    const classes = useStyles();

    const [tab, setTab] = useState<TabValue>('import');

    const [state] = useEditState();
    const disabled = state.layouts.length === 0;

    return (
        <>
            <TabList
                selectedValue={tab}
                onTabSelect={(ev, data) => setTab(data.value as TabValue)}
                className={classes.tabs}
            >
                <Tab value="import">Import devicetree</Tab>
                <Tab value="positions" disabled={disabled}>
                    Edit position map
                </Tab>
                <Tab value="export" disabled={disabled}>
                    Export devicetree
                </Tab>
            </TabList>

            <div className={classes.content}>
                {tab === 'import' && <ImportPage onImport={() => setTab('positions')} />}
                {tab === 'positions' && <PositionMapPage />}
                {tab === 'export' && <ExportPage />}
            </div>
        </>
    );
};

const useStyles = makeStyles({
    tabs: {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'center',
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow4,
        zIndex: 1,
    },
    content: {
        height: 'calc(100vh - 44px)',
        overflowY: 'hidden',
        backgroundColor: tokens.colorNeutralBackground2,

        scrollbarColor: `${tokens.colorNeutralForeground2} ${tokens.colorNeutralBackground2}`,
    },
});
