import { HMApi } from "../../hub/api";
import { FieldProps } from "./fields";

export function FieldTypeSlider({ field, value, setValue, error, setError }: FieldProps<number, HMApi.T.SettingsField.TypeSlider>) {

    if (field.min === undefined)
        field.min = 0;
    if (field.max === undefined)
        field.max = 100;
    if (field.step === undefined)
        field.step = 1;

    field.appearance ||= {
        type: 'horizontal'
    }

    return (
        <label className="slider">
            <div className="label">
                {field.label}
            </div>
            {field.description && <div className="description">
                {field.description}
            </div>}

            {field.appearance.type === 'horizontal' ? (
                <div className={`input-and-value horizontal ${field.appearance.width || 'large'}`}>
                    <input type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step === 0 ? 'any' : field.step}
                        value={value}
                        onChange={e => setValue(e.target.valueAsNumber)}
                        className={`${field.color || ''}`}
                    />
                    {field.showValue && <span className="value">
                        {value}
                    </span>}
                </div>
            ) : field.appearance.type === 'vertical' ? (
                <div className={`input-and-value vertical ${field.appearance.height || 'large'}`}>
                    <div>
                        <input type="range"
                            min={field.min}
                            max={field.max}
                            step={field.step === 0 ? 'any' : field.step}
                            value={value}
                            onChange={e => setValue(e.target.valueAsNumber)}
                            className={`${field.color || ''}`}
                        />
                    </div>
                    {field.showValue && <span className="value">
                        {value}
                    </span>}
                </div>
            ) : (
                null
            )}
        </label>
    )
}
