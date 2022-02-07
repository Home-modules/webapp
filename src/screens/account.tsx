import './account.scss';
import React from 'react';
import { connect } from 'react-redux';
import { handleError, logoutFromHub, sendRequest } from '../comms/request';
import { store, StoreState } from '../store';
import IntermittentableButton from '../ui/intermittentable-button';

function AccountPage({token}: Pick<StoreState, 'token'>) {
    const [sessionsCount, setSessionsCount] = React.useState(-1); // Special values: -1 = loading, -2 = error

    React.useEffect(()=>{
        sendRequest({
            'type': 'getSessionsCount'
        }).then(res=> {
            if(res.type==='ok') {
                setSessionsCount(res.data.sessions);
            } else {
                setSessionsCount(-2);
                handleError(res);
            }
        }).catch(err=> {
            setSessionsCount(-2);
            handleError(err);
        });
    }, []);

    return (
        <main id="account-info">
            <h1>
                Logged in to Home_modules hub as: <strong>@{token?.split(':')[0]}</strong>
                <IntermittentableButton onClick={()=>logoutFromHub()} onCatch={handleError}>Log out</IntermittentableButton>
            </h1>

            <h2>Account settings</h2>

            {
                sessionsCount===-1 ? <p className="session-count loading">Loading active sessions count...</p> :
                sessionsCount===-2 ? <p className="session-count error">Could not load active sessions count</p> :
                <p className="session-count">You have {sessionsCount} active {sessionsCount===1 ? 'session' : 'sessions'}</p>
            }
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
                disabled={sessionsCount===1} // When there is only one session, there is no other session to terminate and the button will be pointless
            >
                Terminate other sessions
            </IntermittentableButton>
        </main>
    )
}

export default connect<Pick<StoreState, 'token'>, {}, {}, StoreState>(({token})=>({token}))(AccountPage);