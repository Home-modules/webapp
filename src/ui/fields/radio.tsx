import React from 'react';
import { HMApi } from '../../hub/api';
import { SettingItemTextSelect } from '../settings/text-select';
import { FieldProps } from './fields';
import "./radio.scss";

export function FieldTypeRadio({ field, value, setValue, error, setError }: FieldProps<string, HMApi.T.SettingsField.TypeRadio>) {
    return (
        <SettingItemTextSelect
            title={field.label}
            options={field.options}
            value={value}
            onChange={setValue}
            description={field.description}
        />
    );

}
