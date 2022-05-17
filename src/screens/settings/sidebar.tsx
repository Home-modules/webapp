import './sidebar.scss';
import React from 'react';
import { faDoorClosed, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import version from '../../version';

export default function SettingsSidebar() {
    return (
        <nav className="settings-sidebar">
            <NavLink 
                to="/settings/account"
                className={({isActive}) => isActive ? 'active' : ''}>
                <FontAwesomeIcon icon={faUserCircle}/>
                <span>Account</span>
            </NavLink>
            <NavLink
                to="/settings/rooms"
                className={({isActive}) => isActive ? 'active' : ''}>
                <FontAwesomeIcon icon={faDoorClosed}/>
                <span>Rooms</span>
            </NavLink>
            <div className="space-filler" />
            <div className="footer">
                Home_modules {version}
            </div>
        </nav>
    );
}