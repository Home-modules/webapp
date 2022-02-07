import './account.scss';
import React from 'react';
import { connect } from 'react-redux';
import { handleError, logoutFromHub, sendRequest } from '../comms/request';
import { store, StoreState } from '../store';
import IntermittentableButton from '../ui/intermittentable-button';

function AccountPage({token}: Pick<StoreState, 'token'>) {
    return (
        <main id="account-info">
            <h1>
                Logged in to Home_modules hub as: <strong>@{token?.split(':')[0]}</strong>
                <IntermittentableButton onClick={()=>logoutFromHub()} onCatch={handleError}>Log out</IntermittentableButton>
            </h1>

            <h2>Account settings</h2>

            <IntermittentableButton 
                onClick={()=>{
                    return sendRequest({
                        "type": "logoutOtherSessions"
                    });
                }}
                onCatch={handleError}
                onThen={(e)=>{
                    if(e.type==='ok') {
                        store.dispatch({
                            type: 'ADD_NOTIFICATION',
                            notification: {
                                type: 'success',
                                message: `${e.data.sessions} other sessions were terminated`
                            }
                        });
                    }
                }}
            >
                Terminate other sessions
            </IntermittentableButton>
        </main>
    )
}

export default connect<Pick<StoreState, 'token'>, {}, {}, StoreState>(({token})=>({token}))(AccountPage);