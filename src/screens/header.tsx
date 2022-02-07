import './header.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog } from '@fortawesome/free-solid-svg-icons'
import { store, StoreState } from '../store';
import { connect } from 'react-redux';
import HomePage from './home';
import SettingsPage from './settings/settings';

function Header({CurrentScreen}: Pick<StoreState, 'CurrentScreen'>) {
    function setScreen(Screen: React.ComponentType<any>) {
        store.dispatch({type: 'SET_CURRENT_SCREEN', screen: Screen});
    }
    return (
        <header>
            <button data-title="Home" 
                data-selected={CurrentScreen===HomePage} 
                onClick={()=>setScreen(HomePage)} >
                <FontAwesomeIcon icon={faHome} />
            </button>
            <button data-title="Settings"
                data-selected={CurrentScreen===SettingsPage}
                onClick={()=>setScreen(SettingsPage)} >
                <FontAwesomeIcon icon={faCog} />
            </button>
        </header>
    );
}

export default connect<Pick<StoreState, 'CurrentScreen'>, {}, {}, StoreState>(({CurrentScreen})=>({CurrentScreen}))(Header);
