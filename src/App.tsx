import React from 'react';
import { connect } from 'react-redux';
import './App.scss';
import Header from './screens/header';
import { StoreState } from './store';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { sendRequest } from './hub/request';
import version from './version';

function App({token}: Pick<StoreState, 'token'>) {
    const navigate = useNavigate();
    React.useEffect(()=> {
        if(token) {
            sendRequest({
                type: "getVersion"
            }).then(e=>{
                if(e.type === 'ok') {
                    if(e.data.version !== version) {
                        navigate(`/invalid-version?current=${e.data.version}`);
                    }
                }
            })
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [token]);

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