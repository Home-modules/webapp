import { IconDefinition, IconName } from "@fortawesome/free-solid-svg-icons";
import IconSelect from "../fields/icon-select";
import SettingItem, { SettingItemProps } from "./setting";
import "./icon-select.scss"

export type SettingItemIconSelectProps = SettingItemProps & {
    /** A list of icon */
    icons: IconDefinition[],
    /** The index of the selected icon */
    value: IconName,
    /** Fired when the selected icon changes */
    onChange: (value: IconName) => void
}

export function SettingItemIconSelect({ title, description, icon, className='', icons, value, onChange }: SettingItemIconSelectProps) {
    return (
        <SettingItem
            title={title}
            icon={icon}
            description={description}
            className={`icon--select ${className}`}
        >
            <IconSelect icons={icons} value={value} onChange={onChange}/>
        </SettingItem>
    )
}