import './header.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog } from '@fortawesome/free-solid-svg-icons'
import { NavLink } from 'react-router-dom';

export default function Header() {
    function onKeyDown(e: React.KeyboardEvent<HTMLAnchorElement>) {
        const element =
            e.key === 'ArrowLeft' ?
                (e.target as HTMLElement).previousElementSibling :
            e.key === 'ArrowRight' ?
                (e.target as HTMLElement).nextElementSibling :
            null;
        
        if (element?.tagName === 'A') {
            (element as HTMLElement).focus();
        }
    }

    return (
        <header>
            <NavLink
                className={({isActive}) => isActive ? 'active' : ''}
                to="/home"
                onKeyDown={onKeyDown}
            >
                <span>Home</span>
                <FontAwesomeIcon icon={faHome} />
            </NavLink>
            <NavLink
                className={({isActive}) => isActive ? 'active' : ''}
                to="/settings"
                onKeyDown={onKeyDown}
            >
                <span>Settings</span>
                <FontAwesomeIcon icon={faCog} />
            </NavLink>
        </header>
    );
}
