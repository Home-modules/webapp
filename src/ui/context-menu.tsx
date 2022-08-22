import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { store, StoreState } from "../store"
import './context-menu.scss'

export type ContextMenuProps = {
    x: number,
    y: number,
    children: React.ReactChild | (React.ReactChild|null)[],
}

export function ContextMenu({x, y, children}: ContextMenuProps) {
    const [closing, setClosing] = React.useState(false)

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
            <div className="context-menu" style={{ left: x, top: y }}>
                <div className="content">
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