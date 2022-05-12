import './account.scss';
import React from 'react';
import { connect } from 'react-redux';
import { handleError, logoutFromHub, sendRequest } from '../../../comms/request';
import { store, StoreState } from '../../../store';
import { IntermittentableButton } from '../../../ui/button';
import { Link, Outlet } from 'react-router-dom';

function SettingsPageAccount({token}: Pick<StoreState, 'token'>) {
    const [sessionsCount, setSessionsCount] = React.useState(-1); // Special values: -1 = loading, -2 = error

    React.useEffect(()=>{
        sendRequest({
            'type': 'account.getSessionsCount'
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
        <main id="settings-account-info">
            <h1>
                Logged in to Home_modules hub as: <strong>@{token?.split(':')[0]}</strong>
                <IntermittentableButton onClick={()=>logoutFromHub()} onCatch={handleError} attention>
                    Log out
                </IntermittentableButton>
            </h1>

            <h2>Account settings</h2>

            <p>
                {
                    sessionsCount===-1 ? <span className="session-count loading">Loading active sessions count...</span> :
                    sessionsCount===-2 ? <span className="session-count error">Could not load active sessions count</span> :
                    <span className="session-count">You have {sessionsCount} active {sessionsCount===1 ? 'session' : 'sessions'}</span>
                }
                <br/>
                <IntermittentableButton 
                    onClick={()=>{
                        return sendRequest({
                            "type": "account.logoutOtherSessions"
                        });
                    }}
                    onCatch={handleError}
                    onThen={(e)=>{
                        if(e.type==='ok') {
                            setSessionsCount(1);
                            store.dispatch({
                                type: 'ADD_NOTIFICATION',
                                notification: {
                                    type: 'success',
                                    message: e.data.sessions===1?
                                        "Terminated 1 other session":
                                        `Terminated ${e.data.sessions} other sessions`
                                }
                            });
                        }
                    }}
                    disabled={sessionsCount===1} // When there is only one session, there is no other session to terminate and the button will be pointless
                    attention
                >
                    Terminate other sessions
                </IntermittentableButton>
            </p>

            <Link to="/settings/account/change-password" className='button'>Change password</Link> 
            <> </>
            <Link to="/settings/account/change-username" className='button'>Change username</Link> 

            <Outlet />
        </main>
    )
}

export default connect<Pick<StoreState, 'token'>, {}, {}, StoreState>(({token})=>({token}))(SettingsPageAccount);