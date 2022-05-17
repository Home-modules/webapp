import './change-username.scss';
import React from 'react';
import { HMApi } from '../../../hub/api';
import { handleError, sendRequest } from '../../../hub/request';
import { store } from '../../../store';
import { IntermittentSubmitButton } from '../../../ui/button';
import { RouteDialog } from '../../../ui/dialogs';
import { useNavigate } from 'react-router-dom';

export default function ChangeUsernameDialog() {
    const [username, setUsername] = React.useState(store.getState().token?.split(':')[0] || '');
    const [usernameError, setUsernameError] = React.useState('');
    const usernameRef= React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [isAvailable, setIsAvailable] = React.useState<boolean|0>(0); // 0= loading false= taken true= available
    const [isAvailableError, setIsAvailableError] = React.useState(0);  // 0= Already taken 1= Too short

    const navigate= useNavigate();

    React.useEffect(() => {
        if(username.length < 3) {
            setIsAvailableError(1);
            setIsAvailable(false);
        } else {
            setIsAvailable(0);
            sendRequest({
                type: 'account.checkUsernameAvailable',
                username
            }).then(res => {
                if(isAvailableError === 1 && isAvailable===false) return; // If the username was too short, don't change the state
                if(res.type==='ok') {
                    setIsAvailable(res.data.available);
                    setIsAvailableError(0); // This error is only shown if the username is taken
                } else {
                    handleError(res);
                }
            }).catch(handleError);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            navigate('/settings/account');
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
            else if(res.error.message==="USERNAME_TOO_SHORT"){
                setUsernameError("Username must be at least 3 characters long");
                usernameRef.current?.focus();
            }
            else handleError(res);
        }
    }

    return (
        <RouteDialog className='change-username-dialog' title='Change username'>
            <form onSubmit={e=>e.preventDefault()}>
                <p className="warning">Warning: Other sessions will be logged out!</p>
                <label className='text' data-error={usernameError}>
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
                    <div className="taken">{["Username already taken", "Username must be at least 3 characters long"][isAvailableError]}</div>
                    <div className="available">Username available</div>
                </div>
                <IntermittentSubmitButton onClick={onSubmit} onThen={onSuccess} onCatch={onError} disabled={isAvailable===false}>
                    Change Username
                </IntermittentSubmitButton>
            </form>
        </RouteDialog>
    )
}