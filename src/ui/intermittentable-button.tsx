import './button.scss';
import './form.scss';
import React from 'react';

export type IntermittentableButtonProps<T> = {
    onClick: () => Promise<T>;
    children: React.ReactNode | React.ReactNode[];
    className?: string;
    disabled?: boolean;
    onThen?: (result: T) => void;
    onCatch?: (error: T) => void;
    primary?: boolean;
}

export default function IntermittentableButton<T>({onClick, children, className='', disabled, onThen=()=>undefined, onCatch=()=>undefined, primary=false}: IntermittentableButtonProps<T>) {
    const [intermittent, setIntermittent] = React.useState(false);

    function click() {
        setIntermittent(true);
        onClick().then(onThen).catch(onCatch).finally(()=>setIntermittent(false));
    }

    return (
        <button 
            className={`button ${className} ${intermittent?'intermittent':''} ${primary?'primary':''}`} 
            onClick={click} 
            disabled={disabled || intermittent}>

            {children}
        </button>
    );
}

export function IntermittentableSubmitButton<T>({onClick, children, className='', disabled, onThen=()=>undefined, onCatch=()=>undefined}: Omit<IntermittentableButtonProps<T>, 'primary'> & {children:string}) {
    const [intermittent, setIntermittent] = React.useState(false);

    function click() {
        setIntermittent(true);
        onClick().then(onThen).catch(onCatch).finally(()=>setIntermittent(false));
    }

    return (
        <>
            <input 
                className={className} 
                type="submit" 
                onClick={click} 
                disabled={disabled || intermittent} 
                value={children} />
            {intermittent && <div className="intermittent"></div>}
        </>
    );
}
