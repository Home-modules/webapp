import React from 'react';
import { HMApi } from '../../hub/api';
import { handleError, sendRequest } from '../../hub/request';
import DropDownSelect from '../dropdown/dropdown';
import { LazyDropDownSelect } from "../dropdown/lazy";
import { FieldProps } from './fields';

export function FieldTypeSelect({ field, value, setValue, error, setError, context }: FieldProps<string, HMApi.SettingsFieldSelect>) {
    if ('isLazy' in field.options) {
        return (
            <>
                {field.label}
                <LazyDropDownSelect
                    className={field.description ? 'has-description' : ''}
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
                    }} />
                {field.description && <div className="description">
                    {field.description}
                </div>}
            </>
        );
    }
    return (
        <>
            {field.label}
            <DropDownSelect
                className={field.description ? 'has-description' : ''}
                options={field.options}
                value={value}
                onChange={setValue}
                error={error}
                allowCustomValue={field.allowCustomValue}
                showSearchBar={field.showSearchBar}
                onOpen={() => setError('')} />
            {field.description && <div className="description">
                {field.description}
            </div>}
        </>
    );
}
