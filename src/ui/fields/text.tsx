import React from 'react';
import { HMApi } from '../../comms/api';
import { FieldProps } from './fields';

export function FieldTypeText({ field, value, setValue, error, setError }: FieldProps<string, HMApi.SettingsFieldText>) {
    const pfRef = React.useRef(null) as React.RefObject<HTMLSpanElement>;
    const [pfWidth, setPfWidth] = React.useState<undefined | number>(undefined);
    React.useEffect(() => {
        if (field.postfix && pfRef.current) {
            setPfWidth(pfRef.current.clientWidth);
        }
    }, [field.postfix]);

    return (
        <>
            <label data-error={error} className={`text ${field.description ? 'has-description' : ''}`}>
                {field.label}
                <input type="text" value={value} onChange={e => {
                    setValue(e.target.value);
                    setError('');
                }}
                    placeholder={field.placeholder}
                    minLength={field.min_length}
                    maxLength={field.max_length}
                    style={pfWidth ? {
                        paddingRight: (4 + pfWidth + 10) + 'px'
                    } : undefined} />

                {field.postfix && <span className="postfix" ref={pfRef}>
                    {field.postfix}
                </span>}

            </label>
            {field.description && <div className="description">
                {field.description}
            </div>}
        </>
    );
}
