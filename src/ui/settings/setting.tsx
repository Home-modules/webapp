import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import "./setting.scss"

export type SettingItemProps = {
    title: string,
    icon?: IconDefinition,
    className?: string
}

export default function SettingItem({ title, icon, children, className="" }: SettingItemProps & { children: React.ReactChild | React.ReactChild[] }) {
    return (
        <div className={`setting-item ${className}`}>
            <div className="title">
                {icon && <FontAwesomeIcon icon={icon} />}
                <span>{title}</span>
            </div>
            <div className="value">
                {children}
            </div>
        </div>
    )
}