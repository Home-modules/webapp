import './sidebar.scss';
import React from 'react';
import { faBrush, faCirclePlay, faDoorClosed, faPlug, faPuzzlePiece, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import version from '../../version';
import ScrollView from '../../ui/scrollbar';

export default function SettingsSidebar() {
    function onKeyDown(e: React.KeyboardEvent<HTMLAnchorElement>) {
        const element =
            e.key === 'ArrowUp' ?
                (e.target as HTMLElement).previousElementSibling :
            e.key === 'ArrowDown' ?
                (e.target as HTMLElement).nextElementSibling :
            null;

        if (element?.tagName === 'A') {
            (element as HTMLElement).focus();
            (element as HTMLElement).click();
        }
    }

    return (
        <ScrollView tagName='nav' className="settings-sidebar">
            <NavLink
                to="/settings/account"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faUserCircle} />
                <span>Account</span>
            </NavLink>
            <NavLink
                to="/settings/rooms"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faDoorClosed} />
                <span>Rooms</span>
            </NavLink>
            <NavLink
                to="/settings/devices"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faPlug} />
                <span>Devices</span>
            </NavLink>
            <NavLink
                to="/settings/plugins"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faPuzzlePiece} />
                <span>Plugins</span>
            </NavLink>
            <NavLink
                to="/settings/appearance"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faBrush} />
                <span>Appearance</span>
            </NavLink>
            <NavLink
                to="/settings/automation"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faCirclePlay} />
                <span>Automation</span>
            </NavLink>

            <div className="space-filler" />
            <div className="footer">
                <span className="mobile">v{version}</span>
                <span className="desktop">Home_modules {version}</span>
            </div>
        </ScrollView>
    );
}