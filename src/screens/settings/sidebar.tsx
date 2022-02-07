import './sidebar.scss';
import React from 'react';
import { faDoorClosed, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type SettingsSidebarProps = {
    page: number,
    onChangePage: (page: number)=> void
}

export default function SettingsSidebar({page, onChangePage}: SettingsSidebarProps) {
    return (
        <nav className="settings-sidebar">
            <button 
                className={page===0 ? 'active':''}
                onClick={()=>onChangePage(0)}>
                <FontAwesomeIcon icon={faUserCircle}/>
                <span>Account</span>
            </button>
            <button
                className={page===1 ? 'active':''}
                onClick={()=>onChangePage(1)}>
                <FontAwesomeIcon icon={faDoorClosed}/>
                <span>Rooms</span>
            </button>
        </nav>
    );
}