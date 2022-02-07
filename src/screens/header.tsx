import './header.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faHome } from '@fortawesome/free-solid-svg-icons'
import { store, StoreState } from '../store';
import { connect } from 'react-redux';
import HomePage from './home';
import AccountPage from './account';

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
            <button data-title="Account"
                data-selected={CurrentScreen===AccountPage}
                onClick={()=>setScreen(AccountPage)} >
                <FontAwesomeIcon icon={faUserCircle} />
            </button>
        </header>
    );
}

export default connect<Pick<StoreState, 'CurrentScreen'>, {}, {}, StoreState>(({CurrentScreen})=>({CurrentScreen}))(Header);
