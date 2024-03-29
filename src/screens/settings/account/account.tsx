import './account.scss';
import React from 'react';
import { connect } from 'react-redux';
import { handleError, logoutFromHub, sendRequest } from '../../../hub/request';
import { StoreState } from '../../../store';
import Button from '../../../ui/button';
import { Link, Outlet } from 'react-router-dom';
import ScrollView from '../../../ui/scrollbar';
import { addConfirmationFlyout } from '../../../ui/flyout';
import { SettingItemEditableInfo } from '../../../ui/settings/editable-info';
import { faAt, faKey, faLaptop } from '@fortawesome/free-solid-svg-icons';

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
        <ScrollView tagName='main' id="settings-account-info">
            {/* <h1>
                Logged in to Home_modules as <strong>@{token?.split(':')[0]}</strong>
                <Button onClick={(e)=>{
                    addConfirmationFlyout({
                        element: e.target,
                        text: "Are you sure you want to log out?",
                        confirmText: "Log Out",
                        attention: true,
                        async: true,
                        onConfirm: ()=>logoutFromHub().catch(handleError),
                    })
                }} attention>
                    Log out
                </Button>
            </h1> */}

            <h1>
                Account settings
            
                <Button onClick={(e)=>{
                    addConfirmationFlyout({
                        element: e.target,
                        text: "Are you sure you want to log out?",
                        confirmText: "Log Out",
                        attention: true,
                        async: true,
                        onConfirm: ()=>logoutFromHub().catch(handleError),
                    })
                }} attention>
                    Log out
                </Button>
            </h1>
{/* 
            <p>
                <Link to="/settings/account/active-sessions" className='button'>
                    Active sessions {sessionsCount > 0 ? <>({sessionsCount})</> : ''}
                </Link>
            </p>

            <Link to="/settings/account/change-password" className='button'>Change password</Link> 
            <> </>
            <Link to="/settings/account/change-username" className='button'>Change username</Link>  */}

            <div className="settings">
                <SettingItemEditableInfo
                    title="Username"
                    icon={faAt}
                    value={token?.split(':')[0] || ''}
                    onEdit="/settings/account/change-username"
                />
                <SettingItemEditableInfo
                    title="Password"
                    icon={faKey}
                    value="●●●●●●●●"
                    onEdit="/settings/account/change-password"
                />
                <SettingItemEditableInfo
                    title="Devices"
                    icon={faLaptop}
                    value={sessionsCount > 0 ? sessionsCount.toString() : ''}
                    buttonText="View"
                    onEdit="/settings/account/active-sessions"
                />
            </div>

            <Outlet />
        </ScrollView>
    )
}

export default connect<Pick<StoreState, 'token'>, {}, {}, StoreState>(({token})=>({token}))(SettingsPageAccount);