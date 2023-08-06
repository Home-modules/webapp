import { IconDefinition, IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { uniqueId } from "../../utils/uniqueId";
import './icon-select.scss';

export type IconSelectProps = {
    /** A list of icons */
    icons: IconDefinition[],
    /** The index of the selected icon */
    value: IconName,
    /** Fired when the selected icon changes */
    onChange: (value: IconName) => void
}

export default function IconSelect({ icons, value, onChange }: IconSelectProps) {
    const [squareCoordinates, setSquareCoordinates] = React.useState<[number, number] | undefined>(undefined)
    const ref = React.useRef<HTMLDivElement>(null);
    const [id] = React.useState(uniqueId('icon-select-'));
    const valueIndex = icons.findIndex(i => i.iconName === value);

    React.useEffect(() => {
        if (ref.current) {
            const child = ref.current.childNodes[valueIndex] as HTMLLabelElement;
            setSquareCoordinates([
                child.offsetLeft,
                child.offsetTop
            ])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <div className='icon-select' ref={ref}>
            {icons.map((icon, index) => (
                <label key={icon.iconName}>
                    <input
                        type='radio'
                        name={id}
                        value={icon.iconName}
                        checked={icon.iconName === value}
                        onChange={(e) => {
                            if (e.target.checked) {
                                onChange(icon.iconName);
                            }
                        }}
                    />
                    <FontAwesomeIcon icon={icon} />
                </label>
            ))}
            <div className="square" style={squareCoordinates && { left: squareCoordinates[0] + 'px', top: squareCoordinates[1] + 'px' }} />
        </div>
    )
}