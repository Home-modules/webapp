import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import './icon-select.scss';

export type IconSelectProps = {
    /** A list of icon */
    icons: IconDefinition[],
    /** The index of the selected icon */
    value: number,
    /** Fired when the selected icon changes */
    onChange: (value: number) => void
}

export default function IconSelect({icons, value, onChange}: IconSelectProps) {
    const [squareCoordinates, setSquareCoordinates] = React.useState([0, 0])
    const ref = React.useRef(null) as React.RefObject<HTMLDivElement>;

    React.useEffect(()=> {
        if(ref.current) {
            const child = ref.current.childNodes[value] as SVGSVGElement
            const parentCoordinates = ref.current.getBoundingClientRect();
            const coordinates = child.getBoundingClientRect();
            setSquareCoordinates([
                coordinates.x - parentCoordinates.x, 
                coordinates.y - parentCoordinates.y
            ])
        }
    }, [value])

    return(
        <div className='icon-select' data-icon={value} ref={ref}>
            {icons.map((icon, index) => (
                <FontAwesomeIcon icon={icon} onClick={()=> {
                    if(value !== index) {
                        onChange(index);
                    }
                }} className={index===value? 'selected':''} />
            ))}
            <div className="square" style={{left: squareCoordinates[0]+'px', top: squareCoordinates[1]+'px'}} />
        </div>
    )
}