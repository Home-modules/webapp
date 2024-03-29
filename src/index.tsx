import React from 'react';
import ReactDOM from 'react-dom';
import './ui/index.scss';
import App, { AppRedirect } from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './store';
import { Route, Routes, Navigate, HashRouter } from 'react-router-dom';
import Notifications from './ui/notifications';
import Dialogs from './ui/dialogs';
import {Flyouts} from './ui/flyout';
import { CurrentContextMenu } from './ui/context-menu';

import HomePage from './screens/home/home';
import SettingsPage from './screens/settings/settings';
import SettingsPageAccount from './screens/settings/account/account';
import SettingsPageRooms from './screens/settings/rooms/rooms';
import SettingsPageRoomsEditRoom from './screens/settings/rooms/room-edit';
import LoginForm from './screens/login';
import ChangePasswordDialog from './screens/settings/account/change-password';
import ChangeUsernameDialog from './screens/settings/account/change-username';
import SettingsPageRoomsDevices from './screens/settings/rooms/devices/devices';
import SettingsPageRoomsDevicesNewDevice from './screens/settings/rooms/devices/new';
import SettingsPageRoomsDevicesEditDevice from './screens/settings/rooms/devices/edit-device';
import InvalidVersionPage from './screens/invalid-version';
import ActiveSessions from './screens/settings/account/active-sessions';
import HomePageRoom from './screens/home/room';
import SettingsPagePlugins, { SettingsPagePluginsTab } from './screens/settings/plugins/plugins';
import SettingsPageAppearance, { getAppearanceSetting } from './screens/settings/appearance/appearance';

export const darkThemeMediaQuery = matchMedia("(prefers-color-scheme: dark)");
export function updateTheme() {
    const setting = getAppearanceSetting('colorTheme');
    const isDarkNow = (setting === 'system') ?
        darkThemeMediaQuery.matches :
        setting === 'dark';

    if (isDarkNow)
        document.documentElement.classList.add('dark');
    else
        document.documentElement.classList.remove('dark');
};
darkThemeMediaQuery.addEventListener('change', updateTheme);
updateTheme();

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <HashRouter>
                <Notifications />
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/invalid-version" element={<InvalidVersionPage />} />
                    <Route path="/" element={<App />}>
                        <Route path="home" element={<HomePage />}>
                            <Route index element={<HomePageRoom />} />
                            <Route path=":roomId" element={<HomePageRoom />} />
                        </Route>
                        <Route path="settings" element={<SettingsPage />}>
                            <Route path="account" element={<SettingsPageAccount />}>
                                <Route path="change-password" element={<ChangePasswordDialog />} />
                                <Route path="change-username" element={<ChangeUsernameDialog />} />
                                <Route path="active-sessions" element={<ActiveSessions />} />
                                <Route path="*" element={<Navigate to="/settings/account" />} />
                            </Route>
                            <Route path="rooms" element={<SettingsPageRooms />}>
                                <Route path=":roomId/edit" element={<SettingsPageRoomsEditRoom />} />
                                <Route path="new" element={<SettingsPageRoomsEditRoom />} />
                                <Route path="*" element={<Navigate to="/settings/rooms" />} />
                            </Route>
                            <Route path="devices" element={<SettingsPageRooms devicesScreen />}>
                                <Route path=":roomId" element={<SettingsPageRoomsDevices />}>
                                    <Route path="new" element={<SettingsPageRoomsDevicesNewDevice />} >
                                        <Route path=":deviceType" element={<SettingsPageRoomsDevicesEditDevice   />} />
                                    </Route>
                                    <Route path="edit/:deviceId" element={<SettingsPageRoomsDevicesEditDevice />} />
                                </Route>
                            </Route>
                            <Route path="plugins" element={<SettingsPagePlugins />}>
                                <Route path="installed" element={<SettingsPagePluginsTab tab="installed" />} />
                                <Route path="all" element={<SettingsPagePluginsTab tab="all" />} />
                                <Route path="*" element={<Navigate to="/settings/plugins/installed" />} />
                                <Route index element={<Navigate to="/settings/plugins/installed" replace />} />
                            </Route>
                            <Route path="appearance" element={<SettingsPageAppearance />} />
                            <Route path="*" element={<Navigate to="/settings/account" />} />
                            <Route index element={<Navigate to="/settings/account" replace />} />
                        </Route>
                        <Route index element={<AppRedirect />} />
                        <Route path="*" element={<AppRedirect />} />
                    </Route>
                </Routes>
                <Dialogs />
                <Flyouts />
                <CurrentContextMenu />
            </HashRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
