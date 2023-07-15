import './account.scss';
import React from 'react';
import { connect } from 'react-redux';
import { handleError, logoutFromHub, sendRequest } from '../../../hub/request';
import { StoreState } from '../../../store';
import { Outlet } from 'react-router-dom';
import ScrollView from '../../../ui/scrollbar';
import { addConfirmationFlyout } from '../../../ui/flyout';
import { SettingItemEditableInfo } from '../../../ui/settings/editable-info';
import { faArrowRightFromBracket, faAt, faKey, faLaptop } from '@fortawesome/free-solid-svg-icons';
import { Header } from '../../../ui/header';

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
            <Header
                title="Account Settings"
                buttons={[{
                    icon: faArrowRightFromBracket,
                    label: "Log out",
                    attention: true,
                    onClick(e) {
                        addConfirmationFlyout({
                            element: e.target,
                            text: "Are you sure you want to log out?",
                            confirmText: "Log Out",
                            attention: true,
                            async: true,
                            onConfirm: () => logoutFromHub().catch(handleError),
                        });
                    }
                }]}
            />
            <div className="settings">
                <SettingItemEditableInfo
                    title="Username"
                    icon={faAt}
                    buttonText='Change'
                    value={token?.split(':')[0] || ''}
                    onEdit="/settings/account/change-username"
                />
                <SettingItemEditableInfo
                    title="Password"
                    icon={faKey}
                    buttonText='Change'
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