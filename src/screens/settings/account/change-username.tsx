import './change-username.scss';
import React from 'react';
import { HMApi } from '../../../comms/api';
import { handleError, sendRequest } from '../../../comms/request';
import { store } from '../../../store';
import { IntermittentableSubmitButton } from '../../../ui/button';

export default function showChangeUsernameDialog() {
    store.dispatch({
        type: 'ADD_DIALOG',
        dialog: {
            title: 'Change Username',
            className: 'change-username-dialog',
            children: ChangeUsernameDialog
        }
    });
}

export function ChangeUsernameDialog({ close }: { close: () => void }) {
    const [username, setUsername] = React.useState(store.getState().token?.split(':')[0] || '');
    const [usernameError, setUsernameError] = React.useState('');
    const usernameRef= React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [isAvailable, setIsAvailable] = React.useState<boolean|0>(0);

    React.useEffect(() => {
        setIsAvailable(0);
        sendRequest({
            type: 'account.checkUsernameAvailable',
            username
        }).then(res => {
            if(res.type==='ok') {
                setIsAvailable(res.data.available);
            } else {
                handleError(res);
            }
        }).catch(handleError);
    }, [username]);

    function onSubmit() {
        return sendRequest({
            type: 'account.changeUsername',
            username
        });
    }

    function onSuccess(res: HMApi.Response<HMApi.RequestChangeUsername>) {
        if(res.type==='ok') {
            store.dispatch({
                type: 'SET_TOKEN',
                token: res.data.token
            });
            close();
            store.dispatch({
                type: 'ADD_NOTIFICATION',
                notification: {
                    type: 'success',
                    message: 'Username changed successfully'
                }
            });
        } else {
            handleError(res);
        }
    }

    function onError(res: HMApi.Response<HMApi.RequestChangeUsername>) {
        if(res.type==='error') {
            if(res.error.message==="USERNAME_ALREADY_TAKEN"){
                setUsernameError("Username already taken");
                usernameRef.current?.focus();
            }
            else handleError(res);
        }
    }

    return (
        <form onSubmit={e=>e.preventDefault()}>
            <p className="warning">Warning: Other sessions will be logged out!</p>
            <label data-error={usernameError}>
                New Username
                <input 
                    type="text"
                    value={username}
                    ref={usernameRef}
                    onChange={(event) => {
                        setUsername(event.target.value);
                        setUsernameError('');
                    }} />
            </label>
            <div className={`status ${isAvailable===0?'loading' : isAvailable ? 'available':'taken'}`}>
                <div className="loading">Checking username availability...</div>
                <div className="taken">Username already taken</div>
                <div className="available">Username available</div>
            </div>
            <IntermittentableSubmitButton onClick={onSubmit} onThen={onSuccess} onCatch={onError} disabled={isAvailable===false}>
                Change Username
            </IntermittentableSubmitButton>
        </form>
    )
}