import React from 'react';
import { HMApi } from '../../hub/api';
import { FieldProps } from './fields';
import "./checkbox.scss";
import { SettingItemToggle } from '../settings/toggle';

export function FieldTypeCheckBox({ field, value, setValue, error, setError }: FieldProps<boolean, HMApi.T.SettingsField.TypeCheckbox>) {
    const description = (value === true && field.description_on_true) || field.description;
    return (
        <SettingItemToggle
            title={field.label}
            onChange={val => {
                setValue(val);
                setError('');
            }}
            state={value}
            description={description}
        />
    );
}
