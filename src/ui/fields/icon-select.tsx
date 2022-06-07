import { IconDefinition, IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { HMApi } from "../../hub/api";
import { uniqueId } from "../../uniqueId";
import './icon-select.scss';

export type IconSelectProps = {
    /** A list of icon */
    icons: IconDefinition[],
    /** The index of the selected icon */
    value: IconName,
    /** Fired when the selected icon changes */
    onChange: (value: IconName) => void
}

export default function IconSelect({icons, value, onChange}: IconSelectProps) {
    const [squareCoordinates, setSquareCoordinates] = React.useState<[number, number]|undefined>(undefined)
    const ref = React.useRef(null) as React.RefObject<HTMLDivElement>;
    const [id] = React.useState(uniqueId('icon-select-'));
    const valueIndex = icons.findIndex(i=> i.iconName === value);

    React.useEffect(()=> {
        const inAnimation = !squareCoordinates; // When the component mount, it is inside a scale animation from 75% to 100% and squareCoordinates isn't yet set.
        if(ref.current) {
            const child = ref.current.childNodes[valueIndex] as SVGSVGElement
            const parentCoordinates = ref.current.getBoundingClientRect();
            const coordinates = child.getBoundingClientRect();
            console.log(parentCoordinates, coordinates);
            setSquareCoordinates([
                (coordinates.x - parentCoordinates.x)*(inAnimation?(1/0.75) : 1), 
                (coordinates.y - parentCoordinates.y)*(inAnimation?(1/0.75) : 1)
            ])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return(
        <div className='icon-select' data-icon={value} ref={ref}>
            {icons.map((icon, index) => (
                <FontAwesomeIcon key={icon.iconName} icon={icon} onClick={()=> {
                    if(value !== icon.iconName) {
                        onChange(icon.iconName);
                    }
                }} className={icon.iconName===value? 'selected':''} />
            ))}
            <div className="square" style={squareCoordinates && {left: squareCoordinates[0]+'px', top: squareCoordinates[1]+'px'}} />
        </div>
    )
}