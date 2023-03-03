import React from 'react';
import { HMApi } from '../../hub/api';
import { handleError, sendRequest } from '../../hub/request';
import { SettingItemDropdown } from '../settings/dropdown';
import { SettingItemLazyDropdown } from '../settings/lazydropdown';
import { FieldProps } from './fields';

export function FieldTypeSelect({ field, value, setValue, error, setError, context }: FieldProps<string, HMApi.T.SettingsField.TypeSelect>) {
    if ('isLazy' in field.options) {
        return (
            <SettingItemLazyDropdown
                title={field.label}
                description={field.description}
                value={value}
                onChange={setValue}
                lazyOptions={field.options}
                allowCustomValue={field.allowCustomValue}
                showSearchBar={field.showSearchBar}
                error={error}
                onOpen={() => setError('')}
                callback={() => {
                    return sendRequest({
                        type: "plugins.fields.getSelectLazyLoadItems",
                        ...context,
                        field: field.id
                    }).then(res => {
                        if (res.type === 'ok') {
                            return res.data.items;
                        } else {
                            handleError(res);
                            return {
                                error: true
                            };
                        }
                    }, err => {
                        handleError(err);
                        return {
                            error: true
                        };
                    });
                }}
            />
        );
    }
    return (
        <SettingItemDropdown
            title={field.label}
            description={field.description}
            options={field.options}
            value={value}
            onChange={setValue}
            error={error}
            allowCustomValue={field.allowCustomValue}
            showSearchBar={field.showSearchBar}
            onOpen={() => setError('')}
        />
    );
}
