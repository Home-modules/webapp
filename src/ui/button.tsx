import './button.scss';
import './form.scss';
import React from 'react';

export type ButtonProps = {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode|React.ReactNodeArray;
    className?: string;
    disabled?: boolean;
    primary?: boolean;
    attention?: boolean;
    buttonRef?: React.LegacyRef<HTMLButtonElement>;
} & Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'onClick'>

export default function Button({
    onClick, children, className = '', disabled = false, primary = false, attention = false, buttonRef, ...rest
}: ButtonProps) {
    return (
        <button 
            className={`button ${className} ${primary?'primary':''} ${attention?'attention':''}`} 
            onClick={onClick} 
            disabled={disabled}
            ref={buttonRef}
            {...rest}
        >
            {children}
        </button>
    );
}

export type IntermittentButtonProps<E extends HTMLElement> = Omit<ButtonProps, 'onClick'> & {
    onClick: (e: React.MouseEvent<E>) => Promise<any>;
} & Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'onClick'>;

export function IntermittentButton({
    onClick, children, className = '', disabled, primary = false, attention = false, buttonRef, ...rest
}: IntermittentButtonProps<HTMLButtonElement>) {
    const [intermittent, setIntermittent] = React.useState(false);

    function click(e: React.MouseEvent<HTMLButtonElement>) {
        const promise= onClick(e);
        if(promise) {
            setIntermittent(true);
            promise.finally(()=>setIntermittent(false));
        }
    }

    return (
        <button 
            className={`button ${className} ${intermittent?'intermittent':''} ${primary?'primary':''} ${attention?'attention':''}`} 
            onClick={click} 
            disabled={disabled || intermittent}
            ref={buttonRef}
            {...rest}
        >
            {children}
        </button>
    );
}

export function IntermittentSubmitButton({onClick, children, className='', disabled}: Omit<IntermittentButtonProps<HTMLInputElement>, 'primary'> & {children:string}) {
    const [intermittent, setIntermittent] = React.useState(false);

    function click(e: React.MouseEvent<HTMLInputElement>) {
        const promise= onClick(e);
        if(promise) {
            setIntermittent(true);
            promise.finally(()=>setIntermittent(false));
        }
    }

    return (
        <>
            <input 
                className={className} 
                type="submit" 
                onClick={click} 
                disabled={disabled || intermittent} 
                value={children}
            />
            {intermittent && <div className="intermittent"></div>}
        </>
    );
}
