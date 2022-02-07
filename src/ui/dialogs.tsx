import './dialogs.scss';
import React from "react";
import { connect } from "react-redux";
import { store, StoreState } from "../store";

export type DialogProps = {
    title?: string,
    children: React.ReactNode|React.ReactNodeArray | ((props:{close: () => void})=>void),
    onClose?: ()=> void,
    cancellable?: boolean,
    id: string,
}

export function Dialog({title, children, onClose, id, cancellable=true}: DialogProps) {
    const ref= React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
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

    React.useEffect(()=>{
        ref.current?.focus();
    }, []);

    return (
        <div className={`dialog-container ${closing? 'closing':''}`} 
            ref={ref} onClick={handleClose} tabIndex={0} onKeyPress={e=>{
                if(e.key==='Escape') {
                    cancellable && close();
                }
            }}>
            <div className="dialog">
                {title && <h1>{title}</h1>}
                <div className="content">
                    {typeof children==='function'? children({close}): children}
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
