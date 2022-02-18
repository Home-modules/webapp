import './header.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog } from '@fortawesome/free-solid-svg-icons'
import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header>
            <NavLink data-title="Home" 
                className={({isActive}) => isActive ? 'active' : ''}
                to="/home">
                <FontAwesomeIcon icon={faHome} />
            </NavLink>
            <NavLink data-title="Settings"
                className={({isActive}) => isActive ? 'active' : ''}
                to="/settings">
                <FontAwesomeIcon icon={faCog} />
            </NavLink>
        </header>
    );
}
