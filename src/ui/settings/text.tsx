import "./text.scss";
import SettingItem, { SettingItemProps } from "./setting";
import React from "react";

export type SettingItemTextProps = SettingItemProps & {
    value: string,
    onChange: ((value: string) => void),
    postfix?: string,
    placeholder?: string,
    minLength?: number,
    maxLength?: number,
    error?: string,
    onBlur?: React.FocusEventHandler<HTMLInputElement>,
    autofocus?: boolean,
    iRef?: React.LegacyRef<HTMLInputElement>,
    disabled?: boolean
}

export function SettingItemText({
    title, description, icon, className = '',
    value, onChange,
    postfix, placeholder, minLength, maxLength,
    error, onBlur, autofocus, iRef, disabled
}: SettingItemTextProps) {
    const pfRef = React.useRef<HTMLSpanElement>(null);
    const [pfWidth, setPfWidth] = React.useState<undefined | number>(undefined);
    React.useEffect(() => {
        if (postfix && pfRef.current) {
            setPfWidth(pfRef.current.clientWidth);
        }
    }, [postfix]);

    return (
        <SettingItem
            title={title}
            icon={icon}
            description={description}
            className={`text ${className}`}
        >
            <label className="text" data-error={error}>
                <input type="text" value={value} onChange={e => {
                    onChange(e.target.value);
                }}
                    placeholder={placeholder}
                    minLength={minLength}
                    maxLength={maxLength}
                    style={pfWidth ? {
                        paddingRight: (4 + pfWidth + 10) + 'px'
                    } : undefined}
                    onBlur={onBlur}
                    autoFocus={autofocus}
                    ref={iRef}
                    disabled={disabled}
                />

                {postfix && <span className="postfix" ref={pfRef}>
                    {postfix}
                </span>}

            </label>
        </SettingItem>
    )
}