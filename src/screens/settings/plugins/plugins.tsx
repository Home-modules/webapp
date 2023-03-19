import { faRotate, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, Outlet, useSearchParams } from 'react-router-dom';
import { handleError, sendRequest, sendRestartingRequest } from '../../../hub/request';
import { store, StoreState } from '../../../store';
import Button, { IntermittentButton } from '../../../ui/button';
import { addConfirmationFlyout } from '../../../ui/flyout';
import { PlaceHoldersArray } from '../../../ui/placeholders';
import ScrollView from '../../../ui/scrollbar';
import SearchKeywordHighlight from '../../../ui/search-highlight';
import './plugins.scss';

export function updateInstalledPlugins() {
    sendRequest({
        type: "plugins.getInstalledPlugins"
    }).then(res => {
        setPlugins(res.data.plugins);
    }, err => {
        setPlugins(false);
        handleError(err);
    });

    function setPlugins(plugins: StoreState['plugins']['installed']) {
        store.dispatch({
            type: "SET_PLUGINS",
            list: "installed",
            plugins
        });
    }
}

export default function SettingsPagePlugins() {

    function updatePlugins() {
        updateInstalledPlugins();
    }
    React.useEffect(updatePlugins, []);

    return (
        <div id="settings-plugins">
            <h1>
                <span>Plugins</span>
                <button className="icon restart" onClick={e => addConfirmationFlyout({
                    element: e.target,
                    text: "Restart the hub?",
                    confirmText: "Restart",
                    async: true,
                    onConfirm: ()=> sendRestartingRequest({ type: "restart" }),
                })}>
                    <FontAwesomeIcon icon={faRotateRight} />
                </button>
            </h1>

            <div className="tab-view">
                <div className="tab-bar">
                    <NavLink
                        to="/settings/plugins/installed"
                        className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
                    >
                        <span>Installed</span>

                    </NavLink>
                    <NavLink
                        to="/settings/plugins/all"
                        className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
                    >
                        <span>All</span>

                    </NavLink>
                </div>
                <Outlet />
            </div>
        </div>
    )
}

export const SettingsPagePluginsTab = connect(({ plugins: { installed, all } }: StoreState) => ({ installed, all }))(
    function SettingsPagePluginsTab({ installed, all, tab }: StoreState['plugins'] & { tab: "installed" | "all" }) {
        const [searchParams, setSearchParams] = useSearchParams();
        const search = searchParams.get('search') || undefined;

        return (
            <div className="tab installed">
                <div className="toolbar">
                    <label className="text search">
                        <input
                            type="text"
                            value={search || ''}
                            placeholder="Search..."
                            onChange={e => {
                                const value = e.target.value;
                                if (value) {
                                    setSearchParams({ search: value });
                                } else {
                                    setSearchParams({});
                                }
                            }}
                        />
                    </label>
                </div>
                <PlaceHoldersArray
                    className="content"
                    errorPlaceholder="Error loading plugins"
                    items={(installed && search) ? installed.filter(p => (
                        p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.id.toLowerCase().includes(search.toLowerCase())
                    )) : installed}
                    emptyPlaceholder={search ? <>No plugins match your search.</> :
                        <>There are no installed plugins. Install one by going to the <Link to="/settings/plugins/all">All</Link> tab.</>}
                    Wrapper={items => (
                        <ScrollView className="content">
                            {items.map(({ id, name, author, description, activated, compatible, version, authorWebsite, homepage }) => (
                                <div
                                    key={id}
                                    className={`plugin installed ${activated ? 'activated' : ''} ${compatible ? '' : 'incompatible'}`}
                                >
                                    <h2>
                                        <SearchKeywordHighlight term={search}>{name}</SearchKeywordHighlight>
                                        <code className='subtext'><SearchKeywordHighlight term={search}>{id}</SearchKeywordHighlight></code>
                                    </h2>
                                    {author && (
                                        <div className="author">
                                            By {authorWebsite ? author : <a className="author" href={authorWebsite} target="_blank" rel="noreferrer">{author}</a>}
                                        </div>
                                    )}
                                    {description && (
                                        <div className="description">{description}</div>
                                    )}
                                    {activated ? (
                                        <div className='info'>
                                            <strong>Activated</strong> version {version}
                                        </div>
                                    ) : compatible ? (
                                        <div className='info'>
                                            <strong>Installed</strong> version {version}
                                        </div>
                                    ) : (
                                        <div className='info'>
                                            <strong>Incompatible</strong> version {version}
                                        </div>
                                    )}
                                    <div className="actions">
                                        {compatible ? (activated ? (
                                            <Button attention onClick={e => store.dispatch({
                                                type: "ADD_FLYOUT",
                                                flyout: {
                                                    element: e.target as Element,
                                                    children:
                                                        <>Are you sure you want to deactivate this plugin?<br />
                                                            All rooms and devices relying on this plugin will stop working. <br />
                                                            The hub will restart to apply the changes.</>,
                                                    width: 250,
                                                    buttons: [
                                                        {
                                                            text: "Cancel"
                                                        },
                                                        {
                                                            text: "Deactivate",
                                                            attention: true,
                                                            primary: true,
                                                            async: true,
                                                            onClick: () => sendRestartingRequest({
                                                                type: "plugins.togglePluginIsActivated",
                                                                id,
                                                                isActivated: false
                                                            }).catch(handleError)
                                                        }
                                                    ]
                                                }
                                            })}>
                                                Deactivate
                                            </Button>
                                        ) : (
                                            <Button primary onClick={e => store.dispatch({
                                                type: "ADD_FLYOUT",
                                                flyout: {
                                                    element: e.target as Element,
                                                    children:
                                                        <>Activate the plugin? <br />
                                                            The hub will restart to apply the changes.</>,
                                                    width: 180,
                                                    buttons: [
                                                        {
                                                            text: "Cancel"
                                                        },
                                                        {
                                                            text: "Activate",
                                                            primary: true,
                                                            async: true,
                                                            onClick: () => sendRestartingRequest({
                                                                type: "plugins.togglePluginIsActivated",
                                                                id,
                                                                isActivated: true
                                                            }).catch(handleError)
                                                        }
                                                    ]
                                                }
                                            })}>
                                                Activate
                                            </Button>
                                        )) : activated && (
                                            <IntermittentButton
                                                primary
                                                onClick={() => sendRestartingRequest({
                                                    type: "plugins.togglePluginIsActivated",
                                                    id,
                                                    isActivated: false
                                                }).catch(handleError)}
                                            >
                                                Deactivate
                                            </IntermittentButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </ScrollView>
                    )}
                />
            </div>
        );
    }
);