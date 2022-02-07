import './login.scss';
import React from 'react';
import { handleError, loginToHub } from '../comms/request';
import { HMApi } from '../comms/api';
import { IntermittentableSubmitButton } from '../ui/button';

export default function LoginForm() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [usernameError, setUsernameError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const usernameRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
    const passwordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const handleSubmit = () => loginToHub(username, password);
    const onCatch= (e: HMApi.Response<HMApi.Request>)=> {
        if(e.type==='error') {
            if(e.error.message==='LOGIN_USER_NOT_FOUND') {
                setUsernameError("Username not found");
                setPasswordError('');
                usernameRef.current?.focus();
            }
            else if(e.error.message==='LOGIN_PASSWORD_INCORRECT') {
                setUsernameError('');
                setPasswordError("Password incorrect");
                passwordRef.current?.focus();
            } else {
                handleError(e);
            }
        } 
    }

    return (
        <div id="login">
            <h1>Login</h1>
            <form>
                <label data-error={usernameError} >
                    Username
                    <input 
                        type="text" 
                        value={username} 
                        ref={usernameRef}
                        onChange={(event) => {
                            setUsername(event.target.value); 
                            setUsernameError('');
                        }} />
                </label>
                <label data-error={passwordError}>
                    Password
                    <input 
                        type="password" 
                        value={password} 
                        ref={passwordRef}
                        onChange={(event) => {
                            setPassword(event.target.value); 
                            setPasswordError('');
                        }} />
                </label>
                <IntermittentableSubmitButton onClick={handleSubmit} onCatch={onCatch}>
                    Login
                </IntermittentableSubmitButton>
            </form>
        </div>
    );
}