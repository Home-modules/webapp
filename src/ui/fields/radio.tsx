import React from 'react';
import { HMApi } from '../../hub/api';
import { FieldProps } from './fields';

export function FieldTypeRadio({ field, value, setValue, error, setError }: FieldProps<string, HMApi.T.SettingsField.TypeRadio>) {
    const [name] = React.useState(field.id);
    if (field.direction === 'h') {
        return (
            <>
                <div
                    className={`radio-group horizontal ${field.description ? 'has-description' : ''}`}
                    data-error={error}
                >
                    <div className='label'>{field.label}</div>
                    {Object.keys(field.options).map(key => {
                        const option = field.options[key];
                        return (
                            <label key={key}>
                                <input
                                    type="radio"
                                    name={name}
                                    checked={value === key}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setValue(key);
                                            setError('');
                                        }
                                    }} />
                                <span className="label">{option.label}</span>
                            </label>
                        );
                    })}
                </div>
                {field.description && <div className="description">
                    {field.description}
                </div>}
            </>
        );
    } else {
        return (
            <>
                <div
                    className={`radio-group vertical ${field.description ? 'has-description' : ''}`}
                    data-error={error}
                >
                    <div className='label'>{field.label}</div>
                    {Object.keys(field.options).map(key => {
                        const option = field.options[key];
                        return (
                            <React.Fragment key={key}>
                                <label className={option.description ? 'has-description' : ''}>
                                    <input
                                        type="radio"
                                        name={name}
                                        checked={value === key}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setValue(key);
                                                setError('');
                                            }
                                        }} />
                                    <span className="label">{option.label}</span>
                                </label>
                                {option.description && <div className="description">
                                    {option.description}
                                </div>}
                            </React.Fragment>
                        );
                    })}
                </div>
                {field.description && <div className="description">
                    {field.description}
                </div>}
            </>
        );
    }
}
