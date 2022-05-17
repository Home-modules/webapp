import React from 'react';
import { HMApi } from '../../hub/api';
import { FieldProps } from './fields';

export function FieldTypeNumber({ field, value, setValue, error, setError }: FieldProps<number, HMApi.SettingsFieldNumber>) {
    const pfRef = React.useRef(null) as React.RefObject<HTMLSpanElement>;
    const [pfWidth, setPfWidth] = React.useState<undefined | number>(undefined);
    React.useEffect(() => {
        if (field.postfix && pfRef.current) {
            setPfWidth(pfRef.current.clientWidth);
        }
    }, [field.postfix]);

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
        <>
            <label data-error={error} className={`number ${field.description ? 'has-description' : ''} ${field.scrollable !== false ? 'has-buttons' : ''}`}>
                {field.label}
                <input type="number" value={value} onChange={e => {
                    setValue(e.target.valueAsNumber);
                    setError('');
                }}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    style={{
                        '--postfix-width': (pfWidth || 0) + 'px'
                    } as any}
                    onWheel={e => {
                        if (field.scrollable === false) {
                            const el = document.activeElement as HTMLElement;
                            el.blur?.();
                            setTimeout(() => el.focus?.());
                        }
                    }}
                    onKeyDown={e => {
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            if (field.scrollable === false) {
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
                    }} />

                {field.postfix && <span className="postfix" ref={pfRef}>
                    &nbsp;{field.postfix}
                </span>}

                {(field.scrollable !== false) && <>
                    <button
                        className={`spin up ${upArrowPressed ? 'active' : ''}`}
                        {...nonFocusableProps(setUpArrowPressed)}
                        disabled={field.max === undefined ? false : value >= field.max}
                        onClick={() => setValue(Math.min(value + 1, field.max !== undefined ? field.max : Infinity))} />
                    <button
                        className={`spin down ${downArrowPressed ? 'active' : ''}`}
                        {...nonFocusableProps(setDownArrowPressed)}
                        disabled={field.min === undefined ? false : value <= field.min}
                        onClick={() => setValue(Math.max(value - 1, field.min !== undefined ? field.min : -Infinity))} />
                </>}

            </label>
            {field.description && <div className="description">
                {field.description}
            </div>}
        </>
    );
}
