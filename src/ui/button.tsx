import './button.scss';
import './form.scss';
import React from 'react';

export type ButtonProps = {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode|React.ReactNodeArray;
    className?: string;
    disabled?: boolean;
    primary?: boolean;
}

export default function Button({onClick, children, className='', disabled=false, primary=false}: ButtonProps) {
    return (
        <button 
            className={`button ${className} ${primary?'primary':''}`} 
            onClick={onClick} 
            disabled={disabled}>

            {children}
        </button>
    );
}

export type IntermittentableButtonProps<T> = ButtonProps & {
    onClick: () => (Promise<T>|undefined);
    onThen?: (result: T) => void;
    onCatch?: (error: T) => void;
}

export function IntermittentableButton<T>({onClick, children, className='', disabled, onThen=()=>undefined, onCatch=()=>undefined, primary=false}: IntermittentableButtonProps<T>) {
    const [intermittent, setIntermittent] = React.useState(false);

    function click() {
        const promise= onClick();
        if(promise) {
            setIntermittent(true);
            promise.then(onThen).catch(onCatch).finally(()=>setIntermittent(false));
        }
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
        const promise= onClick();
        if(promise) {
            setIntermittent(true);
            promise.then(onThen).catch(onCatch).finally(()=>setIntermittent(false));
        }
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
