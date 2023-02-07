import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import Button from "../button";
import SettingItem, { SettingItemProps } from "./setting";
import "./editable-info.scss"

export type SettingItemEditableInfoProps = SettingItemProps & {
    value: string,
    onEdit: (() => void) | string,
    buttonText?: string
}

export function SettingItemEditableInfo({ title, icon, value, onEdit, buttonText }: SettingItemEditableInfoProps) {
    return (
        <SettingItem
            title={title}
            icon={icon}
            className="editable-info"
        >
            <span>{value}</span>
            {typeof onEdit === "string" ? (
                <Link className="button" to={onEdit}>
                    {buttonText || <FontAwesomeIcon icon={faPen} />}
                </Link>
            ) : (
                <Button onClick={onEdit}>
                    {buttonText || <FontAwesomeIcon icon={faPen} />}
                </Button>
            )}
        </SettingItem>
    )
}