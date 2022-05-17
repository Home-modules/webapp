import React from "react";
import { useNavigate } from "react-router-dom";
import { HMApi } from "../../../hub/api";
import { handleError, sendRequest } from "../../../hub/request";
import { store } from "../../../store";
import { IntermittentSubmitButton } from "../../../ui/button";
import { RouteDialog } from "../../../ui/dialogs";

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

    function handleSubmit() {
        if(newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords don't match");
            confirmNewPasswordRef.current?.focus();
            return;
        }
        if(newPassword.length < 0) {
            setNewPasswordError("New password is empty");
            newPasswordRef.current?.focus();
            return;
        }
        if(newPassword === currentPassword) {
            setNewPasswordError("New password can't be the same as the current password");
            newPasswordRef.current?.focus();
            return;
        }

        setConfirmPasswordError('');
        return sendRequest({
            type: "account.changePassword",
            oldPassword: currentPassword,
            newPassword: newPassword
        })
    }

    function onSuccess() {
        navigate('/settings/account');
        store.dispatch({
            type: "ADD_NOTIFICATION",
            notification: {
                type: "success",
                message: "Password changed successfully"
            }
        });
    }

    function onError(err: HMApi.Response<HMApi.RequestChangePassword>) {
        if(err.type==='error') {
            if(err.error.message==='LOGIN_PASSWORD_INCORRECT') {
                setCurrentPasswordError("Password incorrect");
                currentPasswordRef.current?.focus();
            } else {
                handleError(err);
            }
        }

    }

    return (
        <RouteDialog className="change-password-dialog" title="Change password">
            <form onSubmit={e=>{e.preventDefault()}}>
                <label className="text" data-error={currentPasswordError}>
                    Current Password
                        <input
                            type="password"
                            value={currentPassword} 
                            ref={currentPasswordRef}
                            onChange={(event) => {
                                setCurrentPassword(event.target.value); 
                                setCurrentPasswordError('');
                                if(newPassword===""){
                                    setNewPasswordError('');
                                }
                            }} />
                </label>
                <label className="text" data-error={newPasswordError}>
                    New Password
                        <input
                            type="password"
                            value={newPassword}
                            ref={newPasswordRef}
                            onChange={(event) => {
                                setNewPassword(event.target.value);
                                setNewPasswordError('');
                                setConfirmPasswordError('');
                            }} />
                </label>
                <label className="text" data-error={confirmPasswordError}>
                    Repeat New Password
                        <input
                            type="password"
                            value={confirmPassword}
                            ref={confirmNewPasswordRef}
                            onChange={(event) => {
                                setConfirmPassword(event.target.value);
                                setConfirmPasswordError('');
                            }} />
                </label>
                <IntermittentSubmitButton onClick={handleSubmit} onThen={onSuccess} onCatch={onError}>
                    Change Password
                </IntermittentSubmitButton>
            </form>
        </RouteDialog>
    )
}