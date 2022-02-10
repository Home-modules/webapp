import './dropdown.scss';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

type DropDownSelectOption<T extends string= string> = {
    label: string;
    value: T;
    subtext?: string;
};

export type DropDownSelectProps<T extends string= string> = {
    options: DropDownSelectOption<T>[];
    onChange: (value: T) => void;
    value: T | DropDownSelectOption<T>;
    onOpen?: ()=> void;
    children?: React.ReactNode|React.ReactNode[]; // Ignored when `options` is not empty
    error?: string;
}

export default function DropDownSelect<T extends string>({options, onChange, value, onOpen, children, error}: DropDownSelectProps<T>) {
    const [open, setOpen] = React.useState(false);
    const [closing, setClosing] = React.useState(false);

    function close() {
        setOpen(false);
        setClosing(true);
        setTimeout(()=> {
            setClosing(false);
        }, 1000);
    }

    return (
        <div className="dropdown-select" data-error={error}>
            <button onClick={()=> {
                setOpen(true);
                onOpen?.();
            }}>
                <span className="title">
                    {(()=> {
                        let option;
                        if(typeof value === 'string') {
                            option = options.find(o => o.value === value);
                        } else {
                            option = value
                        }
                        return option ? (option.subtext ? `${option.label} (${option.subtext})` : option.label) : null
                    })()}
                </span>
                <FontAwesomeIcon icon={faChevronDown} />
            </button>
            <div className={`blur-detector ${open ? 'open' : ''}`} onClick={close} />
            <div className={`dropdown ${open ? 'open' : ''}`}>
                {(open||closing) && (
                    options.length? options.map(option => (
                        <div key={option.value} 
                            className={`item ${option.value === (typeof value==='string' ? value : value.value) ? 'selected' : ''}`} 
                            onClick={()=> {
                                onChange(option.value);
                                close();
                            }}>
                            <span className="label">{option.label}</span>
                            {option.subtext && (
                                <span className="subtext">{option.subtext}</span>
                            )}
                        </div>
                    )): children
                )}
            </div>
        </div>
    );
}