import React from 'react';
import { HMApi } from '../../hub/api';
import { SettingItemText } from '../settings/text';
import { FieldProps } from './fields';
import "./text-number.scss";

export function FieldTypeText({ field, value, setValue, error, setError }: FieldProps<string, HMApi.T.SettingsField.TypeText>) {
    return (
        <SettingItemText
            title={field.label}
            onChange={val => {
                setValue(val);
                setError('');
            }}
            value={value}
            error={error}
            description={field.description}
            maxLength={field.max_length}
            minLength={field.min_length}
            postfix={field.postfix}
            placeholder={field.placeholder}
        />
    );
}