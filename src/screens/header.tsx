import './header.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog } from '@fortawesome/free-solid-svg-icons'
import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header>
            <NavLink
                className={({isActive}) => isActive ? 'active' : ''}
                to="/home">
                <span>Home</span>
                <FontAwesomeIcon icon={faHome} />
            </NavLink>
            <NavLink
                className={({isActive}) => isActive ? 'active' : ''}
                to="/settings">
                <span>Settings</span>
                <FontAwesomeIcon icon={faCog} />
            </NavLink>
        </header>
    );
}
