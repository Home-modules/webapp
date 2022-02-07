import React from "react";
import { HMApi } from "../../../comms/api";
import { handleError, sendRequest } from "../../../comms/request";
import { store } from "../../../store";
import { IntermittentableSubmitButton } from "../../../ui/button";

export default function showChangePasswordDialog() {
    store.dispatch({
        type: "ADD_DIALOG", 
        dialog: {
            title: "Change Password", 
            children: ChangePasswordDialog
        }
    });
}

function ChangePasswordDialog({close}: {close: ()=>void}) {
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [currentPasswordError, setCurrentPasswordError] = React.useState('');
    const currentPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [newPassword, setNewPassword] = React.useState("");
    const [newPasswordError, setNewPasswordError] = React.useState('');
    const newPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [confirmPasswordError, setConfirmPasswordError] = React.useState('');
    const confirmNewPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

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
        close();
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
        <form onSubmit={e=>{e.preventDefault()}}>
            <label data-error={currentPasswordError}>
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
            <label data-error={newPasswordError}>
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
            <label data-error={confirmPasswordError}>
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
            <IntermittentableSubmitButton onClick={handleSubmit} onThen={onSuccess} onCatch={onError}>
                Change Password
            </IntermittentableSubmitButton>
        </form>
    )
}