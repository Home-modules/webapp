import { HMApi } from "../../hub/api";
import { FieldProps } from "./fields";

export function FieldTypeSlider({ field, value, setValue, error, setError }: FieldProps<number, HMApi.T.SettingsField.TypeSlider>) {
    return (
        <Slider
            onChange={setValue}
            value={value}
            appearance={field.appearance}
            color={field.color}
            min={field.min}
            description={field.description}
            label={field.label}
            max={field.max}
            postfix={field.postfix}
            showValue={field.showValue}
            step={field.step}
        />
    )
}

export type SliderProps = {
    label?: string,
    description?: string,
    appearance?: HMApi.T.SettingsField.TypeSlider['appearance'],
    min?: number,
    max?: number,
    step?: number,
    color?: HMApi.T.UIColor,
    showValue?: boolean,
    postfix?: string,
    value: number,
    onChange: (value: number) => void,
    onPointerUp?: () => void,
}

export default function Slider({
    label,
    description,
    appearance = { type: 'horizontal' },
    min = 0,
    max = 100,
    step = 1,
    color,
    showValue = false,
    postfix = "",
    value,
    onChange,
    onPointerUp,
}: SliderProps) {
    return (
        <label className="slider">
            {label && <div className="label">
                {label}
            </div>}
            {description && <div className="description">
                {description}
            </div>}

            {appearance.type === 'horizontal' ? (
                <div className={`input-and-value horizontal ${appearance.width || 'large'}`}>
                    <input type="range"
                        min={min}
                        max={max}
                        step={step === 0 ? 'any' : step}
                        value={value}
                        onChange={e => onChange(e.target.valueAsNumber)}
                        onPointerUp={onPointerUp}
                        className={color || ''}
                    />
                    {showValue && <span className="value">
                        {value}{postfix}
                    </span>}
                </div>
            ) : appearance.type === 'vertical' ? (
                <div className={`input-and-value vertical ${appearance.height || 'large'}`}>
                    <div>
                        <input type="range"
                            min={min}
                            max={max}
                            step={step === 0 ? 'any' : step}
                            value={value}
                            onChange={e => onChange(e.target.valueAsNumber)}
                            onPointerUp={onPointerUp}
                            className={color || ''}
                        />
                    </div>
                    {showValue && <span className="value">
                        {value}{postfix}
                    </span>}
                </div>
            ) : (
                null
            )}
        </label>
    )
}
