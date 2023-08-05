import SettingItem, { SettingItemProps } from "./setting";
import React from "react";
import ToggleButton from "../fields/toggle-button";

export type SettingItemToggleProps = SettingItemProps & {
    state: boolean,
    onChange: ((value: boolean) => void),
    disabled?: boolean
}

export function SettingItemToggle({
    title, description, icon, className, disabled,
    state, onChange,
}: SettingItemToggleProps) {

    return (
        <SettingItem
            title={title}
            icon={icon}
            description={description}
            className={`toggle ${className}`}
        >
            <ToggleButton
                label=""
                value={state}
                onChange={onChange}
                disabled={disabled}
            />
        </SettingItem>
    )
}