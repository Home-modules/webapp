import './settings.scss';
import React from 'react';
import SettingsPageAccount from './account/account';
import SettingsSidebar from './sidebar';
import SettingsPageRooms from './rooms';

export default function SettingsPage() {
    const [page, setPage] = React.useState(0);

    const Page= [
        SettingsPageAccount,
        SettingsPageRooms
    ][page];

    return (
        <main id="settings">
            <SettingsSidebar page={page} onChangePage={setPage}/>
            <Page/>
        </main>
    );
}

