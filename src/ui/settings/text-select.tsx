import React from "react";
import { uniqueId } from "../../utils/uniqueId";
import SettingItem, { SettingItemProps } from "./setting";
import "./text-select.scss";

export type SettingItemTextSelectProps<T extends string> = SettingItemProps & {
    options: Record<T, string>,
    value: T,
    onChange: (value: T) => void,
};

export function SettingItemTextSelect<T extends string>({
    title, description, icon, className = '',
    options, value, onChange
}: SettingItemTextSelectProps<T>) {
    const [squareCoordinates, setSquareCoordinates] = React.useState<[number, number, number, number] | undefined>(undefined);
    const [squareVisible, setSquareVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const [id] = React.useState(uniqueId('text-select-'));
    const valueIndex = Object.entries(options).findIndex(([op]) => op === value);

    React.useEffect(() => {
        if (ref.current) {
            setSquareVisible(valueIndex !== -1);
            if (valueIndex !== -1) {
                const child = ref.current.childNodes[valueIndex] as HTMLLabelElement;
                setSquareCoordinates([
                    child.offsetLeft,
                    child.offsetTop,
                    child.offsetWidth,
                    child.offsetHeight,
                ]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <SettingItem
            title={title}
            icon={icon}
            description={description}
            className={`text-select ${className}`}
        >
            <div className='text-select' ref={ref}>
                {Object.entries<string>(options).map(([option, label], index) => (
                    <label key={option}>
                        <input
                            type='radio'
                            name={id}
                            value={option}
                            checked={option === value}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    onChange(option as T);
                                }
                            }}
                        />
                        <span>{label}</span>
                    </label>
                ))}
                {squareVisible && (
                    <div
                        className="square"
                        style={squareCoordinates && {
                            left: squareCoordinates[0] + 'px',
                            top: squareCoordinates[1] + 'px',
                            width: squareCoordinates[2] + 'px',
                            height: squareCoordinates[3] + 'px',
                        }}
                    />
                )}
            </div>
        </SettingItem>
    )
}