import './settings.scss';
import React from 'react';
import SettingsSidebar from './sidebar';
import { Outlet } from 'react-router-dom';

export default function SettingsPage() {
    return (
        <main id="settings">
            <SettingsSidebar />
            <Outlet />
        </main>
    );
}

