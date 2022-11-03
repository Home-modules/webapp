import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { store, StoreState } from "../store"
import './context-menu.scss'

window.addEventListener('blur', () => {
    store.dispatch({
        type: "SET_CONTEXT_MENU",
        contextMenu: null
    });
});

export type ContextMenuProps = {
    x: number,
    y: number,
    children: React.ReactChild | (React.ReactChild|null)[],
}

export function ContextMenu({x, y, children}: ContextMenuProps) {
    const [closing, setClosing] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [position, setPosition] = React.useState<React.CSSProperties>({});

    React.useEffect(() => { // Check for overflow and change context menu direction if required
        const menu = contentRef.current!;
        const overflowX = x + menu.clientWidth > window.innerWidth;
        const overflowY = y + menu.clientHeight > window.innerHeight;

        setPosition({
            ["--transform-origin" as any]: (overflowY ? 'bottom' : 'top') + ' ' + (overflowX ? 'right' : 'left'), // Transform origin is the opposite of the menu direction
            ...(overflowX ? { right: window.innerWidth - x } : { left: x }),
            ...(overflowY ? { bottom: window.innerHeight - y } : { top: y }),
        });
    }, [x, y, children]);

    return (
        <div className={`context-menu-container ${closing?'closing':''}`} onClick={e=> {
            setClosing(true);
            setTimeout(()=> {
                store.dispatch({
                    type: "SET_CONTEXT_MENU",
                    contextMenu: null
                });
            }, 500);
        }}>
            <div className="context-menu" style={position}>
                <div className="content" ref={contentRef}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export type ContextMenuItemProps = {
    children: string,
    icon: IconDefinition,
    onClick: () => void,
    href?: undefined,
    attention?: boolean,
} | {
    children: string,
    icon: IconDefinition,
    onClick?: undefined,
    href: string,
    attention?: boolean,
}

export function ContextMenuItem({children, icon, onClick, href, attention}: ContextMenuItemProps) {
    if(href) {
        return (
            <Link to={href} className={`context-menu-item ${attention?'attention':''}`}>
                <FontAwesomeIcon icon={icon} />
                <span>{children}</span>
            </Link>
        )
    }
    return (
        <button className={`context-menu-item ${attention?'attention':''}`} onClick={onClick}>
            <FontAwesomeIcon icon={icon} />
            <span>{children}</span>
        </button>
    )
}

export const CurrentContextMenu = connect(({contextMenu}: StoreState)=>({contextMenu}))(function CurrentContextMenu({contextMenu}: Pick<StoreState, 'contextMenu'>) {
    return contextMenu && <ContextMenu {...contextMenu} />;
});