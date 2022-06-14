import { faExclamationTriangle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HMApi } from "../../../hub/api";
import { handleError, sendRequest } from "../../../hub/request";
import { store } from "../../../store";
import { IntermittentSubmitButton } from "../../../ui/button";
import { RouteDialog } from "../../../ui/dialogs";
import './change-password.scss';

export default function ChangePasswordDialog() {
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [currentPasswordError, setCurrentPasswordError] = React.useState('');
    const currentPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [newPassword, setNewPassword] = React.useState("");
    const [newPasswordError, setNewPasswordError] = React.useState('');
    const newPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [confirmPasswordError, setConfirmPasswordError] = React.useState('');
    const confirmNewPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const navigate= useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    function handleSubmit() {
        if(newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords don't match");
            confirmNewPasswordRef.current?.focus();
            return Promise.reject();
        }
        if(newPassword.length < 0) {
            setNewPasswordError("New password is empty");
            newPasswordRef.current?.focus();
            return Promise.reject();
        }
        if(newPassword === currentPassword) {
            setNewPasswordError("New password can't be the same as the current password");
            newPasswordRef.current?.focus();
            return Promise.reject();
        }

        setConfirmPasswordError('');
        return sendRequest({
            type: "account.changePassword",
            oldPassword: currentPassword,
            newPassword: newPassword
        }).then(res=> {
            navigate('/settings/account');
            store.dispatch({
                type: "ADD_NOTIFICATION",
                notification: {
                    type: "success",
                    message: "Password changed successfully"
                }
            });
        }, (err: HMApi.Response<HMApi.RequestChangePassword>)=> {
            if(err.type==='error') {
                if(err.error.message==='LOGIN_PASSWORD_INCORRECT') {
                    setCurrentPasswordError("Password incorrect");
                    currentPasswordRef.current?.focus();
                } else {
                    handleError(err);
                }
            }
        })
    }

    return (
        <RouteDialog className="change-password-dialog" title="Change password">

            {(searchParams.get('usingDefaultPassword')==='true') && (
                <div className="default-password-warning">
                    <div className="header">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        You are currently using the default password
                        <FontAwesomeIcon icon={faTimes} onClick={()=> setSearchParams({ })} />
                    </div>
                    <div className="body">
                        Using the default password is not secure:
                        <ul>
                            <li>It is easy to guess and makes it very easy to hack.</li>
                            <li>It disables the 24-hour period required before doing sensitive actions.</li>
                        </ul>
                        It is recommended that you change your password as soon as possible.
                    </div>
                </div>
            )}

            <form onSubmit={e=>{e.preventDefault()}}>
                <label className="text" data-error={currentPasswordError}>
                    Current Password
                    <input
                        type="password"
                        value={currentPassword} 
                        ref={currentPasswordRef}
                        autoComplete="current-password"
                        onChange={(event) => {
                            setCurrentPassword(event.target.value); 
                            setCurrentPasswordError('');
                            if(newPassword===""){
                                setNewPasswordError('');
                            }
                        }} 
                    />
                </label>
                <label className="text" data-error={newPasswordError}>
                    New Password
                    <input
                        type="password"
                        value={newPassword}
                        ref={newPasswordRef}
                        autoComplete="new-password"
                        onChange={(event) => {
                            setNewPassword(event.target.value);
                            setNewPasswordError('');
                            setConfirmPasswordError('');
                        }} 
                    />
                </label>
                <label className="text" data-error={confirmPasswordError}>
                    Repeat New Password
                    <input
                        type="password"
                        value={confirmPassword}
                        ref={confirmNewPasswordRef}
                        autoComplete="new-password"
                        onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setConfirmPasswordError('');
                        }} 
                    />
                </label>
                <IntermittentSubmitButton onClick={handleSubmit}>
                    Change Password
                </IntermittentSubmitButton>
            </form>
        </RouteDialog>
    )
}