import React from 'react';
import { connect } from 'react-redux';
import './App.scss';
import LoginForm from './screens/login';
import Header from './screens/header';
import { StoreState } from './store';

function App({token, CurrentScreen}: Pick<StoreState, 'token'|'CurrentScreen'>) {
    return token ? (
        <>
            <Header />
            <CurrentScreen/>
        </>
    ) : <LoginForm/>
}

export default connect<Pick<StoreState, 'token'|'CurrentScreen'>, {}, {}, StoreState>(({token, CurrentScreen})=>({token, CurrentScreen}))(App);
