import './settings.scss';
import React from 'react';
import SettingsSidebar from './sidebar';
import { Navigate, Route, Routes } from 'react-router-dom';
import SettingsPageAccount from './account/account'
import ChangePasswordDialog from './account/change-password';
import ChangeUsernameDialog from './account/change-username';
import ActiveSessions from './account/active-sessions';
import SettingsPageRooms from './rooms/rooms';
import SettingsPageRoomsEditRoom from './rooms/room-edit';
import SettingsPageRoomsDevicesEditDevice from './rooms/devices/edit-device';
import SettingsPageRoomsDevices from './rooms/devices/devices';
import SettingsPageRoomsDevicesNewDevice from './rooms/devices/new';
import SettingsPagePlugins, { SettingsPagePluginsTab } from './plugins/plugins';
import SettingsPageAppearance from './appearance/appearance';
import SettingsPageAppearanceDesktopMode from './appearance/desktop-mode';
import SettingsPageAutomation from './automation/automation';
import SettingsPageAutomationEditRoutine from './automation/edit-routine';

export default function SettingsPage() {
    return (
        <main id="settings">
            <SettingsSidebar />
            <Routes>
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
                            <Route path=":deviceType" element={<SettingsPageRoomsDevicesEditDevice />} />
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
                <Route path="appearance" element={<SettingsPageAppearance />}>
                    <Route path="desktop-mode" element={<SettingsPageAppearanceDesktopMode />} />
                    <Route path="*" element={<Navigate to="/settings/appearance" />} />
                </Route>
                <Route path="automation" element={<SettingsPageAutomation />}>
                    <Route path=":routineId" element={<SettingsPageAutomationEditRoutine />} />
                </Route>
                <Route path="*" element={<Navigate to="/settings/account" />} />
                <Route index element={<Navigate to="/settings/account" replace />} />
            </Routes>
        </main>
    );
}

