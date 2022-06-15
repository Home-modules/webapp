import './notifications.scss';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { connect } from "react-redux";
import { store, StoreState } from "../store";
import { Link } from 'react-router-dom';

export type NotificationProps= {
    id: string,
    title?: string,
    message: React.ReactNode|React.ReactNode[],
    type?: 'error' | 'success' | 'info' | 'warning',
    buttons?: ({
        label: string,
        onClick: () => void,
        isPrimary?: boolean
    } | {
        label: string,
        route: string,
        isPrimary?: boolean
    })[],
    hideCloseButton?: boolean,
    timeout?: number
}

export function Notification({id, title, message, type='info', buttons=[], hideCloseButton=false, timeout=5000}: NotificationProps) {
    const [visible, setVisible] = React.useState<''|'closing'|'fading'>('');
    const [isNew, setIsNew] = React.useState(true);
    const [height, setHeight] = React.useState('auto');
    const divRef = React.useRef<HTMLDivElement>(null);
    const [hide, setHide] = React.useState(true);

    function close(mode: typeof visible = 'closing') {
        if(visible.length) return;
        setVisible(c=> c==='closing' ? 'closing' : mode);
        setTimeout(()=>{
            store.dispatch({type: 'REMOVE_NOTIFICATION', id});
        }, 3000);
    }

    React.useEffect(() => {
        if(timeout > 0) {
            setTimeout(()=>{
                close('fading');
            }, timeout);
        }
        setTimeout(()=>{
            setIsNew(false);
        }, 500)
        setHeight(divRef.current!.offsetHeight+'px');
        setHide(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`notification ${visible} ${isNew?'new':''}`} 
            style={{'--height': height, visibility: hide ? 'hidden':undefined} as any}>
            <div ref={divRef} className={type}>
                {!hideCloseButton && <button className="close" onClick={() => {
                    close();
                }}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>}
                {title && <h1>{title}</h1>}
                <div className="content">{message}</div>
                {buttons.map((button, i) => (
                    'route' in button ? (
                        <Link key={i}
                            className={`button ${button.isPrimary?'primary':''}`}
                            to={button.route} onClick={()=>close()}>
                                
                            {button.label}
                        </Link>
                    ) : (
                        <button key={i} 
                            className={`button ${button.isPrimary ? 'primary' : ''}`} 
                            onClick={()=>{close(); button.onClick()}}>
                                
                            {button.label}
                        </button>
                    )
                ))}
            </div>
        </div>
    )
}

function Notifications({notifications}: Pick<StoreState, 'notifications'>) {
    return (
        <div id="notifications">
            {notifications.map((notification) => (
                <Notification key={notification.id} {...notification} />
            )).reverse()}
        </div>
    )
}

export default connect<Pick<StoreState, 'notifications'>, {}, {}, StoreState>(({notifications}) => ({notifications}))(Notifications);