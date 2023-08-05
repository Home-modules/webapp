import './dialogs.scss';
import React from "react";
import { connect } from "react-redux";
import { store, StoreState } from "../store";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export type DialogProps = {
    title?: string,
    className?: string,
    children: React.ReactNode|React.ReactNodeArray | ((props:{close: () => void})=>void),
    onClose?: ()=> void,
    cancellable?: boolean,
    showCloseButton?: boolean,
    id: string,
}

export function Dialog({title, className='', children: Children, onClose, id, cancellable=true, showCloseButton=false}: DialogProps) {
    const ref= React.useRef<HTMLDivElement>(null);
    const [closing, setClosing] = React.useState(false);

    function close() {
        onClose?.();
        setClosing(true);
        setTimeout(()=>{
            store.dispatch({type: "REMOVE_DIALOG", id});
        }, 1000);
    }

    function handleClose(e: React.MouseEvent<HTMLDivElement>) {
        if(e.target !== ref.current || !cancellable) return;
        close();
    }

    React.useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div
            className={`dialog-container ${closing ? 'closing' : ''} ${className}`} 
            ref={ref}
            onClick={handleClose}
            tabIndex={-1}
            onKeyDown={e => {
                if(e.key==='Escape') {
                    cancellable && close();
                }
            }}
        >
            <div className="dialog">
                {title && <h1>
                    {title}
                    {showCloseButton && (
                        <button className="icon" onClick={close}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </h1>}
                <div className="content">
                    {typeof Children==='function'? <Children close={close}/>: Children}
                </div>
            </div>
        </div>
    );
}

export default connect<Pick<StoreState, 'dialogs'>, {}, {}, StoreState>(
    ({dialogs})=>({dialogs})
)(function Dialogs({dialogs}: Pick<StoreState, 'dialogs'>) {
    return (
        <>
            {dialogs.map(dialog=>
                <Dialog key={dialog.id} {...dialog}/>
            )}
        </>
    );
});

export type RouteDialogProps = {
    title?: string,
    className?: string,
    children: React.ReactNode|React.ReactNodeArray,
    cancellable?: boolean,
    parentRoute?: string,
}

export function RouteDialog({title, className='', children, cancellable= true, parentRoute='..'}: RouteDialogProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [pastFocus, setPastFocus] = React.useState<Element | null>(null);

    const navigate= useNavigate();

    function close() {
        navigate(parentRoute);
        (pastFocus as HTMLElement | null)?.focus();
    }

    function handleClose(e: React.MouseEvent<HTMLDivElement>) {
        if(e.target !== ref.current || !cancellable) return;
        close();
    }

    React.useEffect(() => {
        setPastFocus(document.activeElement);
        ref.current?.focus();
    }, []);

    return (
        <div
            className={`dialog-container ${className}`} 
            ref={ref}
            onClick={handleClose}
            tabIndex={-1}
            onKeyDown={e => {
                if (e.key === 'Escape') {
                    cancellable && close();
                }
            }}
        >
            <div className="dialog">
                {title && <h1>{title}</h1>}
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
}
