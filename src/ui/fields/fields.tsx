import React from 'react';
import { HMApi } from '../../hub/api';
import { searchInDropdownOptions } from "../dropdown/traverse-options";
import { FieldTypeCheckBox } from './checkbox';
import { FieldTypeRadio } from './radio';
import { FieldTypeNumber } from './number';
import { FieldTypeText } from './text';
import { FieldTypeSelect } from './select';
import { FieldTypeSlider } from './slider';
import { SettingItemContainer } from '../settings/container';
import ToggleButton from './toggle-button';
import checkSettingsFieldCondition from '../../utils/field-condition';
import getFlatFields from '../../utils/flat-fields';

export type FieldsProps = {
    fields: HMApi.T.SettingsField[],
    fieldValues: Record<string, string | number | boolean>,
    setFieldValues: (values: Record<string, string | number | boolean>) => void,
    fieldErrors: Record<string, string | undefined>,
    setFieldErrors: (errors: Record<string, string | undefined>) => void,
    context: {
        for: "device",
        controller: string,
        deviceType: string
    } | {
        for: "roomController",
        controller: string
    } | {
        for: "globalTrigger",
        id: string
    } | {
        for: "globalAction",
        id: string
    } | {
        for: "deviceAction",
        controller: string,
        deviceType: string,
        action: string
    }
}

export default function Fields({ fields, fieldValues, setFieldValues, fieldErrors, setFieldErrors, context }: FieldsProps) {
    return <>
        {fields.map((field, index) => (
            field.type === 'container' ? (
                <Container
                    key={index}
                    field={field}
                    {...{ context, fieldValues, fieldErrors, setFieldErrors, setFieldValues }}
                />
            ) : checkSettingsFieldCondition(getFlatFields(fields), field.id, fieldValues) && (
                <Field
                    key={index}
                    field={field}
                    value={fieldValues[field.id]}
                    setValue={value => setFieldValues({ ...fieldValues, [field.id]: value })}
                    error={fieldErrors[field.id]}
                    setError={error => setFieldErrors({ ...fieldErrors, [field.id]: error })}
                    context={context}
                />
            )
        ))}
    </>
}

type ContainerProps = {
    field: HMApi.T.SettingsField.TypeContainer
} & Omit<FieldsProps, "fields">;
function Container(props: ContainerProps) {
    const { field, fieldErrors, fieldValues, context, setFieldErrors, setFieldValues } = props

    const firstChild = field.children[0];
    if (firstChild?.type === "checkbox" && firstChild.label === "Enable") {
        return (
            <ToggleContainer {...props} toggleField={firstChild} />
        )
    }
    return (
        <SettingItemContainer title={field.label}>
            <Fields fields={field.children} {...{ fieldErrors, fieldValues, context, setFieldErrors, setFieldValues }} />
        </SettingItemContainer>
    )
}

type ToggleContainerProps = ContainerProps & {
    toggleField: HMApi.T.SettingsField.TypeCheckbox;
}

function ToggleContainer({ field, fieldErrors, fieldValues, context, setFieldErrors, setFieldValues, toggleField }: ToggleContainerProps) {
    const childrenRef = React.useRef<HTMLDivElement>(null);
    const [everToggled, setEverToggled] = React.useState(false);

    React.useEffect(() => {
        if (fieldValues[toggleField.id] && everToggled) {
            childrenRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }, [fieldValues[toggleField.id], everToggled]);

    return (
        <SettingItemContainer
            title={field.label}
            divRef={childrenRef}
            field={
                <ToggleButton
                    label=""
                    value={fieldValues[toggleField.id] as boolean}
                    onChange={value => {
                        setFieldValues({ ...fieldValues, [toggleField.id]: value });
                        setEverToggled(true);
                    }}
                />
            }
        >
            {fieldValues[toggleField.id] === true ?
                <Fields fields={field.children.slice(1)} {...{ fieldErrors, fieldValues, context, setFieldErrors, setFieldValues }} />
                : <></>}
        </SettingItemContainer>
    )
}

export type FieldProps<
    T extends string | number | boolean = string | number | boolean,
    F extends HMApi.T.SettingsField = HMApi.T.SettingsField
> = {
    field: F,
    value: T,
    setValue: (value: T) => void,
    error: string | undefined,
    setError: (error: string | undefined) => void,
    context: FieldsProps['context']
}

function Field({ field, value, setValue, error, setError, context }: FieldProps) {
    switch (field.type) {
        case 'text': {
            value = value as string;
            return <FieldTypeText field={field} value={value} setValue={setValue} error={error} setError={setError} context={context} />;
        }
        case 'number': {
            value = value as number;
            return <FieldTypeNumber field={field} value={value} setValue={setValue} error={error} setError={setError} context={context} />;
        }
        case 'checkbox': {
            value = value as boolean;
            return <FieldTypeCheckBox field={field} value={value} setValue={setValue} error={error} setError={setError} context={context} />;
        }
        case 'radio': {
            value = value as string;
            return <FieldTypeRadio field={field} value={value} setValue={setValue} error={error} setError={setError} context={context} />;
        }
        case 'select': {
            value = value as string;
            return <FieldTypeSelect field={field} value={value} setValue={setValue} error={error} setError={setError} context={context} />;
        }
        case 'slider': {
            value = value as number;
            return <FieldTypeSlider field={field} value={value} setValue={setValue} error={error} setError={setError} context={context} />;
        }
    }
    return null;
}

export function getSettingsFieldDefaultValue(field: HMApi.T.SettingsField<false>) {
    if (field.default !== undefined) {
        return field.default;
    }
    else {
        switch (field.type) {
            case 'text':
            case 'select':
            case 'radio':
                return '';

            case 'number':
            case 'slider':
                return field.min || 0;

            case 'checkbox':
                return false;
        }
    }
}

export function getSettingsFieldsDefaultValues(fields: HMApi.T.SettingsField<false>[]) {
    return Object.fromEntries(fields.map(field => [field.id, getSettingsFieldDefaultValue(field)]))
}

export function validateField(field: HMApi.T.SettingsField<false>, value: string | number | boolean) {
    switch (field.type) {
        case 'checkbox': {
            if (typeof value !== 'boolean') {
                return {
                    id: field.id,
                    error: "invalid_value_type"
                } as const;
            }
            if (field.required && value === false) {
                return {
                    id: field.id,
                    error: "required_but_unchecked"
                } as const;
            }
            break;
        }

        case 'number': {
            if (typeof value !== 'number') {
                return {
                    id: field.id,
                    error: "invalid_value_type"
                } as const;
            }
            if (field.required && Number.isNaN(value)) {
                return {
                    id: field.id,
                    error: "no_value"
                } as const;
            }
            if (field.min !== undefined && value < field.min) {
                return {
                    id: field.id,
                    error: "number_too_low",
                    custom_text: field.min_error,
                    min: field.min
                } as const;
            }
            if (field.max !== undefined && value > field.max) {
                return {
                    id: field.id,
                    error: "number_too_high",
                    custom_text: field.max_error,
                    max: field.max
                } as const;
            }
            break;
        }

        case 'radio': {
            if (typeof value !== 'string') {
                return {
                    id: field.id,
                    error: "invalid_value_type"
                } as const;
            }
            if (field.required && (!value.length)) {
                return {
                    id: field.id,
                    error: "no_value"
                } as const;
            }
            if (!(value in field.options)) {
                return {
                    id: field.id,
                    error: "no_option_selected"
                } as const;
            }
            break;
        }

        case 'select': {
            if (typeof value !== 'string') {
                return {
                    id: field.id,
                    error: "invalid_value_type"
                } as const;
            }
            if (field.required && (!value.length)) {
                return {
                    id: field.id,
                    error: "no_value"
                } as const;
            }
            if (value.length && (
                ((!field.allowCustomValue) || field.checkCustomValue) &&
                (field.options instanceof Array) &&
                (!searchInDropdownOptions(field.options, value))
            )) {
                return {
                    id: field.id,
                    error: "value_not_in_options"
                } as const;
            }
            break;
        }

        case 'text': {
            if (typeof value !== 'string') {
                return {
                    id: field.id,
                    error: "invalid_value_type"
                } as const;
            }
            if (field.required && (!value.length)) {
                return {
                    id: field.id,
                    error: "no_value"
                } as const;
            }
            if (field.min_length !== undefined && value.length < field.min_length) {
                return {
                    id: field.id,
                    error: "text_too_short",
                    custom_text: field.min_length_error,
                    min: field.min_length
                } as const;
            }
            if (field.max_length !== undefined && value.length > field.max_length) {
                return {
                    id: field.id,
                    error: "text_too_long",
                    custom_text: field.max_length_error,
                    max: field.max_length
                } as const;
            }
        }
    }
}

export function fieldErrorToText(error: ReturnType<typeof validateField>): string | undefined {
    if (!error) return;
    switch (error.error) {
        case 'invalid_value_type':
            return "Invalid value";
        case 'no_option_selected':
            return "Please select an option"
        case 'no_value':
            return "This field is required";
        case 'number_too_high':
            return error.custom_text || `Value cannot be greater than ${error.max}`;
        case 'number_too_low':
            return error.custom_text || `Value cannot be smaller than ${error.min}`;
        case 'required_but_unchecked':
            return "This field must be checked";
        case 'text_too_long':
            return error.custom_text || `Value cannot be longer than ${error.max} characters`;
        case 'text_too_short':
            return error.custom_text || `Value cannot be shorter than ${error.min} characters`;
        case 'value_not_in_options':
            return "Value must be in the options";
    }
}

export function getFieldsErrors(fields: HMApi.T.SettingsField<false>[], values: Record<string, string | number | boolean>): [boolean, Record<string, string | undefined>] {
    const res: Record<string, string | undefined> = {};
    let hasErr = false;
    for (const field of fields) {
        res[field.id] = fieldErrorToText(validateField(field, values[field.id]));
        if (res[field.id]) {
            hasErr = true;
        }
    }
    return [hasErr, res];
}