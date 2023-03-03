import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingItemProps } from "./setting";
import "./container.scss";

export type SettingItemContainerProps = {
    title: string,
    className?: string,
    description?: string,
    children: React.ReactChild | React.ReactChild[]
};

export function SettingItemContainer({ title, description, className='', children }: SettingItemContainerProps) {
    return (
        <div className={`setting-item container ${className}`}>
            <div className="title">
                <span>{title}</span>
                {description && <span className="description">{description}</span>}
            </div>
            <div className="content">
                {children}
            </div>
        </div>
    )
}