import './sidebar.scss';
import React from 'react';
import { faDoorClosed, faPuzzlePiece, faUserCircle } from '@fortawesome/free-solid-svg-icons';
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
        }
    }

    return (
        <ScrollView tagName='nav' className="settings-sidebar">
            <NavLink 
                to="/settings/account"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faUserCircle}/>
                <span>Account</span>
            </NavLink>
            <NavLink
                to="/settings/rooms"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faDoorClosed}/>
                <span>Rooms</span>
            </NavLink>
            <NavLink
                to="/settings/plugins"
                className={({ isActive }) => isActive ? 'active' : ''}
                onKeyDown={onKeyDown}
            >
                <FontAwesomeIcon icon={faPuzzlePiece}/>
                <span>Plugins</span>
            </NavLink>

            <div className="space-filler" />
            <div className="footer">
                Home_modules {version}
            </div>
        </ScrollView>
    );
}