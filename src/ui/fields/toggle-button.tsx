import React from "react";
import promiseTimeout from "../../utils/promise-timeout";

export type ToggleButtonProps = {
    label: string,
    value: boolean,
    onChange(value: boolean): void|Promise<void>,
    disabled?: boolean
}

export default function ToggleButton({ label, value, onChange, disabled }: ToggleButtonProps) {
    const [intermittent, setIntermittent] = React.useState(false);
    return (
        <label className="toggle-button">
            <span className="label">
                {label}
            </span>
            <div className="right">
                <input
                    type="checkbox"
                    checked={value}
                    onChange={() => {
                        const res = onChange(!value);
                        if (res instanceof Promise) {
                            promiseTimeout(res, 100, () => {
                                setIntermittent(true);
                                res.finally(() => setIntermittent(false))
                            });
                        }
                    }}
                    disabled={disabled || intermittent}
                />
                {intermittent && (
                    <div className="intermittent" />
                )}
            </div>
        </label>
    )
};