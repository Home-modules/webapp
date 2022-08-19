import React from "react";
import { HMApi } from "../../../hub/api";
import { handleError, logoutFromHub, sendRequest } from "../../../hub/request";
import { store } from "../../../store";
import Button from "../../../ui/button";
import { RouteDialog } from "../../../ui/dialogs";
import { addConfirmationFlyout } from "../../../ui/flyout";
import './active-sessions.scss';

export default function ActiveSessions() {
    const [sessions, setSessions] = React.useState<HMApi.T.Session[]>([]);

    React.useEffect(()=>{
        sendRequest({
            type: "account.getSessions"
        }).then(res=> {
            if(res.type === 'ok') {
                setSessions(res.data.sessions);
            } else {
                handleError(res);
            }
        }, handleError);
    }, []);
    return (
        <RouteDialog className="active-sessions" title="Active sessions">
            <Button 
                onClick={(e)=>{
                    addConfirmationFlyout({
                        element: e.target,
                        text: "Are you sure you want to terminate other sessions?",
                        width: 205,
                        confirmText: "Terminate",
                        attention: true,
                        async: true,
                        onConfirm: ()=> sendRequest({
                            "type": "account.logoutOtherSessions"
                        }).then(e=> {
                            if(e.type==='ok') {
                                setSessions(sessions=> sessions.filter(s=> s.isCurrent));
                                store.dispatch({
                                    type: 'ADD_NOTIFICATION',
                                    notification: {
                                        type: 'success',
                                        message: e.data.sessions===1? // Plural/singular
                                            "Terminated 1 other session":
                                            `Terminated ${e.data.sessions} other sessions`
                                    }
                                });
                            }
                        }, handleError)
                    })
                }}
                disabled={sessions.length===1} // When there is only one session, there is no other session to terminate and the button is pointless
                attention
                className="terminate-others"
            >
                Terminate other sessions
            </Button>
            <div className="list">
                {sessions.map(session=> (
                    <Session 
                        key={session.id} 
                        session={session} 
                        onTerminated={()=>{
                            if(!session.isCurrent) {
                                store.dispatch({
                                    type: 'ADD_NOTIFICATION',
                                    notification: {
                                        type: 'success',
                                        message: "Terminated session"
                                    }
                                });
                            }
                            setSessions(sessions=> sessions.filter(s=> s.id!==session.id));
                        }}
                    />
                ))}
            </div>
        </RouteDialog>
    )
}

function Session({session, onTerminated}: {session: HMApi.T.Session, onTerminated: ()=>void}) {
    const [expanded, setExpanded] = React.useState(false);
    const loginTime = new Date(session.loginTime);
    const lastUsedTime = new Date(session.lastUsedTime);
    return (
        <div onClick={()=> setExpanded(e=> !e)} className={`item ${expanded? 'expanded':''}`}>
            <div 
                className={`device ${session.isCurrent ? 'current':''}`}
                title={session.device}
            >
                {session.device}
            </div>
            <div className="details">
                <div className="ip">
                    {session.isCurrent ? 
                        <>Current session</> 
                        : 
                        <>IP: {session.ip}</>
                    }
                </div>
                <div className="login-time" title={loginTime.toString()}>
                    Logged in at: {loginTime.toLocaleDateString()} {loginTime.toLocaleTimeString()}
                </div>
                <div className="last-use" title={lastUsedTime.toString()}>
                    Last used: {lastUsedTime.toLocaleDateString()} {lastUsedTime.toLocaleTimeString()}
                </div>
                
                <Button
                    onClick={(e)=> {
                        e.stopPropagation();
                        addConfirmationFlyout({
                            element: e.target,
                            text: `Are you sure you want to ${session.isCurrent? "log out":"terminate this session"}?`,
                            confirmText: session.isCurrent ? "Log Out" : "Terminate",
                            attention: true,
                            async: true,
                            onConfirm: ()=> {
                                return (session.isCurrent ? logoutFromHub() : sendRequest({
                                    type: "account.logoutSession",
                                    id: session.id
                                })).then(e=> {
                                    setExpanded(e=> !e);
                                    if(e.type==='ok') {
                                        onTerminated();
                                    } else {
                                        handleError(e);
                                    }
                                }, handleError);
                            },
                        });
                    }}
                    attention
                    className="terminate"
                >
                    {session.isCurrent ? 'Log Out' : 'Terminate session'}
                </Button>
            </div>
        </div>
    );
}