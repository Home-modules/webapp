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
            cancellable: true, 
            children: ChangePasswordDialog
        }
    });
}

function ChangePasswordDialog({close}: {close: ()=>void}) {
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [currentPasswordError, setCurrentPasswordError] = React.useState(false);
    const currentPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [newPassword, setNewPassword] = React.useState("");
    const [newPasswordError, setNewPasswordError] = React.useState(false);
    const newPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
    const confirmNewPasswordRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    function handleSubmit() {
        if(newPassword !== confirmPassword) {
            setConfirmPasswordError(true);
            confirmNewPasswordRef.current?.focus();
            return;
        }
        if(newPassword.length < 0 || newPassword === currentPassword) {
            setNewPasswordError(true);
            newPasswordRef.current?.focus();
            return;
        }
        
        setConfirmPasswordError(false);
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
                setCurrentPasswordError(true);
                currentPasswordRef.current?.focus();
            } else {
                handleError(err);
            }
        }

    }

    return (
        <form onSubmit={e=>{e.preventDefault()}}>
            <label>
                Current Password
                    <input 
                        type="password"
                        value={currentPassword} 
                        data-error={String(currentPasswordError)} 
                        ref={currentPasswordRef}
                        onChange={(event) => {
                            setCurrentPassword(event.target.value); 
                            setCurrentPasswordError(false);
                        }} />
            </label>
            <label>
                New Password
                    <input
                        type="password"
                        value={newPassword}
                        data-error={String(newPasswordError)}
                        ref={newPasswordRef}
                        onChange={(event) => {
                            setNewPassword(event.target.value);
                        }} />
            </label>
            <label>
                Repeat New Password
                    <input
                        type="password"
                        value={confirmPassword}
                        data-error={String(confirmPasswordError)}
                        ref={confirmNewPasswordRef}
                        onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setConfirmPasswordError(false);
                        }} />
            </label>
            <IntermittentableSubmitButton onClick={handleSubmit} onThen={onSuccess} onCatch={onError}>
                Change Password
            </IntermittentableSubmitButton>
        </form>
    )
}