import React from 'react';
import { connect } from 'react-redux';
import './App.scss';
import Header from './screens/header';
import { StoreState } from './store';
import { Navigate, Outlet } from 'react-router-dom';

function App({token}: Pick<StoreState, 'token'>) {
    if(!token) {
        return <Navigate to="/login" />
    }
    return (
        <>
            <Header />
            <Outlet />
        </>
    )
}

export default connect<Pick<StoreState, 'token'>, {}, {}, StoreState>(({token})=>({token}))(App);

/**
 * Redirect to either home or login, depending on login state
 */
function Redirect({token}: Pick<StoreState, 'token'>) {
    if(token) {
        return <Navigate to="/home" />
    }
    return <Navigate to="/login" />
}

export const AppRedirect = connect<Pick<StoreState, 'token'>, {}, {}, StoreState>(({token})=>({token}))(Redirect);