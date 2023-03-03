import React from 'react';
import { HMApi } from '../../hub/api';
import { SettingItemNumber } from '../settings/number';
import { FieldProps } from './fields';

export function FieldTypeNumber({ field, value, setValue, error, setError }: FieldProps<number, HMApi.T.SettingsField.TypeNumber>) {
    return (
        <SettingItemNumber
            title={field.label}
            onChange={val => {
                setValue(val);
                setError('');
            }}
            value={value}
            error={error}
            description={field.description}
            max={field.max}
            min={field.min}
            scrollable={field.scrollable}
            postfix={field.postfix}
            placeholder={field.placeholder}
        />
    )
}
