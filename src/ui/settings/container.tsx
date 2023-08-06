import "./container.scss";

export type SettingItemContainerProps = {
    title: string,
    className?: string,
    description?: string,
    children: React.ReactChild | React.ReactChild[],
    field?: React.ReactChild | React.ReactChild[],
    divRef?: React.Ref<HTMLDivElement>
};

export function SettingItemContainer({ title, description, className = '', children, field, divRef }: SettingItemContainerProps) {
    return (
        <div className={`setting-item container ${className}`} ref={divRef}>
            <div className="head">
                <div className="title">
                    <span>{title}</span>
                    {description && <span className="description">{description}</span>}
                </div>
                <div className="value">
                    {field}
                </div>
            </div>
            <div className="content">
                {children}
            </div>
        </div>
    )
}