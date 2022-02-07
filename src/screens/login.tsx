import './login.scss';
import React from 'react';
import { handleError, loginToHub } from '../comms/request';
import { HMApi } from '../comms/api';
import { IntermittentableSubmitButton } from '../ui/intermittentable-button';

export default function LoginForm() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [usernameError, setUsernameError] = React.useState(false);
    const [passwordError, setPasswordError] = React.useState(false);
    const usernameRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
    const passwordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const handleSubmit = () => loginToHub(username, password);
    const onCatch= (e: HMApi.Response<HMApi.Request>)=> {
        if(e.type==='error') {
            if(e.error.message==='LOGIN_USER_NOT_FOUND') {
                setUsernameError(true);
                setPasswordError(false);
                usernameRef.current?.focus();
            }
            else if(e.error.message==='LOGIN_PASSWORD_INCORRECT') {
                setUsernameError(false);
                setPasswordError(true);
                passwordRef.current?.focus();
            } else {
                handleError(e);
            }
        } 
    }

    return (
        <div id="login">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Username
                    <input 
                        type="text" 
                        value={username} 
                        data-error={String(usernameError)} 
                        ref={usernameRef}
                        onChange={(event) => {
                            setUsername(event.target.value); 
                            setUsernameError(false);
                        }} />
                </label>
                <label>
                    Password
                    <input 
                        type="password" 
                        value={password} 
                        data-error={String(passwordError)}
                        ref={passwordRef}
                        onChange={(event) => {
                            setPassword(event.target.value); 
                            setPasswordError(false);
                        }} />
                </label>
                <IntermittentableSubmitButton onClick={handleSubmit} onCatch={onCatch}>
                    Login
                </IntermittentableSubmitButton>
            </form>
        </div>
    );
}