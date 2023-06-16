import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HMApi } from "../../../hub/api";
import { handleError, sendRequest } from "../../../hub/request";
import { store, StoreState } from "../../../store";
import { IntermittentSubmitButton } from "../../../ui/button";
import { RouteDialog } from "../../../ui/dialogs";
import './change-password.scss';
import zxcvbn from "zxcvbn";

const ChangePasswordDialog = connect(({ token }: StoreState) => ({ token }))(
    function ChangePasswordDialog({ token }: Pick<StoreState, 'token'>) {
        const [currentPassword, setCurrentPassword] = React.useState("");
        const [currentPasswordError, setCurrentPasswordError] = React.useState('');
        const currentPasswordRef = React.useRef<HTMLInputElement>(null);

        const [newPassword, setNewPassword] = React.useState("");
        const [newPasswordError, setNewPasswordError] = React.useState('');
        const newPasswordRef = React.useRef<HTMLInputElement>(null);

        const [confirmPassword, setConfirmPassword] = React.useState("");
        const [confirmPasswordError, setConfirmPasswordError] = React.useState('');
        const confirmNewPasswordRef = React.useRef<HTMLInputElement>(null);

        const username = token?.split(':')[0];

        const [passwordScore, setPasswordScore] = React.useState(-1);

        const navigate = useNavigate();

        React.useEffect(() => {
            currentPasswordRef.current?.focus();
        }, []);

        React.useEffect(() => {
            if (newPassword)
                setPasswordScore(zxcvbn(newPassword, username ? [username] : undefined).score);
            else
                setPasswordScore(-1);
        }, [newPassword, username]);

        function handleSubmit() {
            if (newPassword !== confirmPassword) {
                setConfirmPasswordError("Passwords don't match");
                confirmNewPasswordRef.current?.focus();
                return Promise.reject();
            }
            if (newPassword.length < 0) {
                setNewPasswordError("New password is empty");
                newPasswordRef.current?.focus();
                return Promise.reject();
            }
            if (newPassword === currentPassword) {
                setNewPasswordError("New password can't be the same as the current password");
                newPasswordRef.current?.focus();
                return Promise.reject();
            }

            setConfirmPasswordError('');
            return sendRequest({
                type: "account.changePassword",
                oldPassword: currentPassword,
                newPassword: newPassword
            }).then(res => {
                navigate('/settings/account');
                store.dispatch({
                    type: "ADD_NOTIFICATION",
                    notification: {
                        type: "success",
                        message: "Password changed successfully"
                    }
                });
            }, (err: HMApi.ResponseOrError<HMApi.Request.Account.ChangePassword>) => {
                if (err.type === 'error') {
                    if (err.error.message === 'LOGIN_PASSWORD_INCORRECT') {
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
                <form onSubmit={e => { e.preventDefault() }}>
                    <input hidden autoComplete="username" name="username" readOnly value={username} />
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
                                if (newPassword === "") {
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
                    <div className={`score s${passwordScore}`}>
                        <span>{["Password strength", "Very Weak", "Weak", "Moderate", "Strong", "Very Strong"][passwordScore+1]}</span>
                    </div>
                    <IntermittentSubmitButton onClick={handleSubmit}>
                        Change Password
                    </IntermittentSubmitButton>
                </form>
            </RouteDialog>
        )
    });
export default ChangePasswordDialog;