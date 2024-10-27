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
    mergeClasses,
    tokens,
} from '@fluentui/react-components';
import { WrenchFilled } from '@fluentui/react-icons';
import { useState } from 'react';
import { ContextProviders } from './ContextProviders';
import { ExportPage } from './ExportPage';
import { GitHubIcon } from './GithubIcon';
import { ImportPage } from './ImportPage';
import { PositionMapPage } from './PositionMapPage';
import { useEditState } from './useEditState';
import { useMediaQuery } from './useMediaQuery';

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
                <TabList
                    className={classes.tabs}
                    selectedValue={tab}
                    onTabSelect={(ev, data) => setTab(data.value as TabValue)}
                >
                    <Tab value="import">Import</Tab>
                    <Tab value="positions" disabled={disabled}>
                        Edit position map
                    </Tab>
                    <Tab value="export" disabled={disabled}>
                        Export devicetree
                    </Tab>
                </TabList>
                <HeaderLinks />
            </div>

            <div className={classes.content}>
                {tab === 'import' && <ImportPage onImport={() => setTab('positions')} />}
                {tab === 'positions' && <PositionMapPage />}
                {tab === 'export' && <ExportPage />}
            </div>
        </>
    );
};

const HeaderLinks: React.FC = () => {
    const classes = useStyles();
    const small = useMediaQuery('(max-width: 768px)');

    return (
        <div className={mergeClasses(classes.links, small && classes.smallLinks)}>
            <Menu positioning="below" persistOnItemClick>
                <MenuTrigger>
                    <Button
                        appearance="subtle"
                        icon={small ? <WrenchFilled /> : undefined}
                        title={small ? 'Other tools' : ''}
                    >
                        {small ? '' : 'Other tools'}
                    </Button>
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
                        <MenuItemLink href="https://zmk-physical-layout-converter.streamlit.app/" target="_blank">
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
                title={small ? 'Open in GitHub' : ''}
            >
                {small ? '' : 'GitHub'}
            </Button>
        </div>
    );
};

const useStyles = makeStyles({
    header: {
        display: 'grid',
        gridTemplate: '". tabs links" auto / 1fr max-content 1fr',
        whiteSpace: 'nowrap',

        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow4,
        zIndex: 1,
    },
    tabs: {
        gridArea: 'tabs',
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'center',
    },
    links: {
        gridArea: 'links',
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'end',
        alignItems: 'center',
        paddingRight: tokens.spacingHorizontalM,
    },
    smallLinks: {
        gap: tokens.spacingHorizontalS,
    },
    content: {
        height: 'calc(100vh - 44px)',
        overflowY: 'hidden',
        backgroundColor: tokens.colorNeutralBackground2,

        scrollbarColor: `${tokens.colorNeutralForeground2} ${tokens.colorNeutralBackground2}`,
    },
});
