import './login.scss';
import React from 'react';
import { handleError, loginToHub } from '../hub/request';
import { HMApi } from '../hub/api';
import { IntermittentSubmitButton } from '../ui/button';
import { store, StoreState } from '../store';
import { connect } from 'react-redux';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';

function LoginForm({token}: Pick<StoreState, 'token'>) {
    const [searchParams] = useSearchParams();
    const location = useLocation()

    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [usernameError, setUsernameError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const usernameRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);
    
    if(location.pathname === '/login' && token) {
        return <Navigate to={searchParams.get('redirect') || '/home'} />
    }

    const handleSubmit = () => loginToHub(username, password).then(res => {
        if(res.type==='ok') {
            if(password==='admin') { // Warn the user to change their password
                store.dispatch({
                    type: 'ADD_NOTIFICATION',
                    notification: {
                        type: 'warning',
                        title: 'Change your password',
                        message: 'You are using the default admin password. Please change it to a more secure password to avoid being hacked.',
                        timeout: 0, // Do not auto-dismiss
                        buttons: [
                            {
                                label: 'Change password',
                                route: '/settings/account/change-password',
                                isPrimary: true
                            }
                        ]
                    }
                });
            }
        }
    }, (e: HMApi.ResponseOrError<HMApi.Request.Account.Login>)=> {
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
    });

    return (
        <div id="login">
            <h1>Login</h1>
            <form>
                <label className='text' data-error={usernameError} >
                    Username
                    <input 
                        type="text" 
                        value={username} 
                        ref={usernameRef}
                        autoComplete="username"
                        onChange={(event) => {
                            setUsername(event.target.value); 
                            setUsernameError('');
                        }} />
                </label>
                <label className='text' data-error={passwordError}>
                    Password
                    <input 
                        type="password" 
                        value={password} 
                        ref={passwordRef}
                        autoComplete="current-password"
                        onChange={(event) => {
                            setPassword(event.target.value); 
                            setPasswordError('');
                        }} />
                </label>
                <IntermittentSubmitButton onClick={handleSubmit}>
                    Login
                </IntermittentSubmitButton>
            </form>
        </div>
    );
}

export default connect((state: StoreState)=>({token: state.token}))(LoginForm);