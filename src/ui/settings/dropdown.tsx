import SettingItem, { SettingItemProps } from "./setting";
import "./dropdown.scss"
import DropDownSelect, { DropDownSelectProps } from "../dropdown/dropdown";

export type SettingItemDropdownProps = SettingItemProps & DropDownSelectProps

export function SettingItemDropdown({ title, description, icon, className='', ...dropdownProps }: SettingItemDropdownProps) {
    return (
        <SettingItem
            title={title}
            icon={icon}
            description={description}
            className={`dropdown ${className}`}
        >
            <DropDownSelect {...dropdownProps} />
        </SettingItem>
    )
}