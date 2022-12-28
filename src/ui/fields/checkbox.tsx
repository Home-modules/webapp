import React from 'react';
import { HMApi } from '../../hub/api';
import { FieldProps } from './fields';
import "./checkbox.scss";

export function FieldTypeCheckBox({ field, value, setValue, error, setError }: FieldProps<boolean, HMApi.T.SettingsField.TypeCheckbox>) {
    const description = (value === true && field.description_on_true) || field.description;
    return (
        <>
            <label
                className={`checkbox ${description ? 'has-description' : ''}`}
                data-error={error}
            >
                <input
                    type="checkbox"
                    checked={value}
                    onChange={e => {
                        setValue(e.target.checked);
                        setError('');
                    }} />
                <span className="label">
                    {field.label}
                    {field.required && <span className="required"> *</span>}
                </span>
            </label>
            {description && <div className="description">
                {description}
            </div>}
        </>
    );
}
