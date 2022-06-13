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
}

export default function Button({onClick, children, className='', disabled=false, primary=false, attention=false}: ButtonProps) {
    return (
        <button 
            className={`button ${className} ${primary?'primary':''} ${attention?'attention':''}`} 
            onClick={onClick} 
            disabled={disabled}>

            {children}
        </button>
    );
}

export type IntermittentButtonProps<T> = Omit<ButtonProps, 'onClick'> & {
    onClick: (e: React.MouseEvent<HTMLElement>) => (Promise<T>|undefined);
    onThen?: (result: T) => void;
    onCatch?: (error: T) => void;
} & Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'onClick'>;

export function IntermittentButton<T>({onClick, children, className='', disabled, onThen=()=>undefined, onCatch=()=>undefined, primary=false, attention= false, ...rest}: IntermittentButtonProps<T>) {
    const [intermittent, setIntermittent] = React.useState(false);

    function click(e: React.MouseEvent<HTMLButtonElement>) {
        const promise= onClick(e);
        if(promise) {
            setIntermittent(true);
            promise.then(onThen, onCatch).finally(()=>setIntermittent(false));
        }
    }

    return (
        <button 
            className={`button ${className} ${intermittent?'intermittent':''} ${primary?'primary':''} ${attention?'attention':''}`} 
            onClick={click} 
            disabled={disabled || intermittent}
            {...rest}>

            {children}
        </button>
    );
}

export function IntermittentSubmitButton<T>({onClick, children, className='', disabled, onThen=()=>undefined, onCatch=()=>undefined}: Omit<IntermittentButtonProps<T>, 'primary'> & {children:string}) {
    const [intermittent, setIntermittent] = React.useState(false);

    function click(e: React.MouseEvent<HTMLElement>) {
        const promise= onClick(e);
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
