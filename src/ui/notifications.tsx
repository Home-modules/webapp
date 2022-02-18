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
    const [hidden, setVisible] = React.useState('');
    const [isNew, setIsNew] = React.useState(true);

    function close(mode='closing') {
        if(hidden.length) return;
        setVisible(mode);
        setTimeout(()=>{
            store.dispatch({type: 'REMOVE_NOTIFICATION', id});
        }, 3000);
    }

    React.useEffect(() => {
        setTimeout(()=>{
            close('fading');
        }, timeout);
        setTimeout(()=>{
            setIsNew(false);
        }, 500)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div className={`notification ${type} ${hidden} ${isNew?'new':''}`}>
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