import React from 'react';
import ReactDOM from 'react-dom';
import './ui/index.scss';
import App, { AppRedirect } from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './store';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Notifications from './ui/notifications';
import Dialogs from './ui/dialogs';
import {Flyouts} from './ui/flyout';

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

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <Notifications />
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/invalid-version" element={<InvalidVersionPage />} />
                    <Route path="/" element={<App />}>
                        <Route path="home" element={<HomePage />} />
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
                                <Route path=":roomId/devices" element={<SettingsPageRoomsDevices />}>
                                    <Route path="new" element={<SettingsPageRoomsDevicesNewDevice />} >
                                        <Route path=":deviceType" element={<SettingsPageRoomsDevicesEditDevice   />} />
                                    </Route>
                                    <Route path="edit/:deviceId" element={<SettingsPageRoomsDevicesEditDevice />} />
                                </Route>
                                <Route path="*" element={<Navigate to="/settings/rooms" />} />
                            </Route>
                            <Route path="*" element={<Navigate to="/settings/account" />} />
                            <Route index element={<Navigate to="/settings/account" />} />
                        </Route>
                        <Route index element={<AppRedirect />} />
                        <Route path="*" element={<AppRedirect />} />
                    </Route>
                </Routes>
                <Dialogs />
                <Flyouts />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
