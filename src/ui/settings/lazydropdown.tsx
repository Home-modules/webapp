import SettingItem, { SettingItemProps } from "./setting";
import "./dropdown"
import { LazyDropDownSelect, LazyDropDownSelectProps } from "../dropdown/lazy";

export type SettingItemLazyDropdownProps = SettingItemProps & LazyDropDownSelectProps

export function SettingItemLazyDropdown({ title, description, className = '', icon, ...dropdownProps }: SettingItemLazyDropdownProps) {
    return (
        <SettingItem
            title={title}
            icon={icon}
            description={description}
            className={`dropdown lazy ${className}`}
        >
            <LazyDropDownSelect {...dropdownProps} />
        </SettingItem>
    )
}