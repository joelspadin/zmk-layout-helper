import {
    Button,
    Menu,
    MenuItemLink,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Tab,
    TabList,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { useState } from 'react';
import { ContextProviders } from './ContextProviders';
import { ExportPage } from './ExportPage';
import { GitHubIcon } from './GithubIcon';
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
            <div className={classes.header}>
                <div></div>
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
                <div className={classes.links}>
                    <Menu positioning="below" persistOnItemClick>
                        <MenuTrigger>
                            <Button appearance="subtle">Other tools</Button>
                        </MenuTrigger>
                        <MenuPopover>
                            <MenuList>
                                <MenuItemLink href="https://www.keyboard-layout-editor.com/" target="_blank">
                                    Keyboard Layout Editor
                                </MenuItemLink>
                                <MenuItemLink href="https://nickcoutsos.github.io/keymap-layout-tools/" target="_blank">
                                    Keymap Layout Tools
                                </MenuItemLink>
                                <MenuItemLink href="https://qmk.fm/converter/" target="_blank">
                                    KLE 🡒 QMK JSON
                                </MenuItemLink>
                                <MenuItemLink
                                    href="https://zmk-physical-layout-converter.streamlit.app/"
                                    target="_blank"
                                >
                                    QMK JSON 🡒 Devicetree
                                </MenuItemLink>
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                    <Button
                        as="a"
                        href="https://github.com/joelspadin/zmk-layout-helper"
                        target="_blank"
                        appearance="subtle"
                        icon={<GitHubIcon />}
                    >
                        GitHub
                    </Button>
                </div>
            </div>

            <div className={classes.content}>
                {tab === 'import' && <ImportPage onImport={() => setTab('positions')} />}
                {tab === 'positions' && <PositionMapPage />}
                {tab === 'export' && <ExportPage />}
            </div>
        </>
    );
};

const useStyles = makeStyles({
    header: {
        display: 'grid',
        gridTemplate: 'auto / 1fr max-content 1fr',

        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow4,
        zIndex: 1,
    },
    tabs: {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'center',
    },
    links: {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'end',
        alignItems: 'center',
        paddingRight: tokens.spacingHorizontalM,
    },
    content: {
        height: 'calc(100vh - 44px)',
        overflowY: 'hidden',
        backgroundColor: tokens.colorNeutralBackground2,

        scrollbarColor: `${tokens.colorNeutralForeground2} ${tokens.colorNeutralBackground2}`,
    },
});
