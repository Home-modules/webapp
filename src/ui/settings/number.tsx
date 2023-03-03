// import "./text.scss";
import SettingItem, { SettingItemProps } from "./setting";
import React from "react";

export type SettingItemNumberProps = SettingItemProps & {
    value: number,
    onChange: ((value: number) => void),
    postfix?: string,
    placeholder?: string,
    min?: number,
    max?: number,
    error?: string,
    onBlur?: React.FocusEventHandler<HTMLInputElement>,
    autofocus?: boolean,
    iRef?: React.LegacyRef<HTMLInputElement>,
    disabled?: boolean,
    scrollable?: boolean
}

export function SettingItemNumber({
    title, description, icon, className='',
    value, onChange,
    postfix, placeholder, min, max,
    error, onBlur, autofocus, iRef, disabled, scrollable
}: SettingItemNumberProps) {
    const pfRef = React.useRef<HTMLSpanElement>(null);
    const [pfWidth, setPfWidth] = React.useState<undefined | number>(undefined);
    React.useEffect(() => {
        if (postfix && pfRef.current) {
            setPfWidth(pfRef.current.clientWidth);
        }
    }, [postfix]);

    const [upArrowPressed, setUpArrowPressed] = React.useState(false);
    const [downArrowPressed, setDownArrowPressed] = React.useState(false);

    function nonFocusableProps(setPressed: React.Dispatch<React.SetStateAction<boolean>>): React.HTMLAttributes<HTMLButtonElement> {
        return {
            tabIndex: -1,
            onFocus: e => { e.preventDefault(); if (e.relatedTarget) { (e.relatedTarget as HTMLElement).focus?.(); } else { e.currentTarget.blur(); } },
            onMouseDown: (e) => setPressed(true),
            onMouseUp: (e) => setPressed(false),
            onMouseLeave: (e) => setPressed(false),
        };
    }

    return (
        <SettingItem
            title={title}
            icon={icon}
            description={description}
            className={`text ${className}`}
        >
            <label className="number" data-error={error}>
                <input
                    type="number"
                    value={value}
                    onChange={e => onChange(e.target.valueAsNumber)}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    style={{
                        '--postfix-width': (pfWidth || 0) + 'px'
                    } as any}
                    onWheel={e => {
                        if (scrollable === false) {
                            const el = document.activeElement as HTMLElement;
                            el.blur?.();
                            setTimeout(() => el.focus?.());
                        }
                    }}
                    onKeyDown={e => {
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            if (scrollable === false) {
                                e.preventDefault();
                            }
                        }
                        if (e.key === 'ArrowUp') {
                            setUpArrowPressed(true);
                        } else if (e.key === 'ArrowDown') {
                            setDownArrowPressed(true);
                        }
                    }}
                    onKeyUp={e => {
                        if (e.key === 'ArrowUp') {
                            setUpArrowPressed(false);
                        } else if (e.key === 'ArrowDown') {
                            setDownArrowPressed(false);
                        }
                    }}
                    onBlur={onBlur}
                    autoFocus={autofocus}
                    ref={iRef}
                    disabled={disabled}
                />

                {postfix && <span className="postfix" ref={pfRef}>
                    &nbsp;{postfix}
                </span>}

                {(scrollable !== false) && <>
                    <button
                        className={`spin up ${upArrowPressed ? 'active' : ''}`}
                        {...nonFocusableProps(setUpArrowPressed)}
                        disabled={max === undefined ? false : value >= max}
                        onClick={() => onChange(Math.min(value + 1, max !== undefined ? max : Infinity))} />
                    <button
                        className={`spin down ${downArrowPressed ? 'active' : ''}`}
                        {...nonFocusableProps(setDownArrowPressed)}
                        disabled={min === undefined ? false : value <= min}
                        onClick={() => onChange(Math.max(value - 1, min !== undefined ? min : -Infinity))} />
                </>}
            </label>
        </SettingItem>
    )
}