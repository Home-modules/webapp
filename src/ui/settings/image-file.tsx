import { store } from "../../store";
import SettingItem, { SettingItemProps } from "./setting";
import "./image-file.scss"

export type SettingItemImageFileProps = SettingItemProps & {
    value: string|null,
    onChange: (value: string | null) => void
}

export function SettingItemImageFile({ title, description, icon, className='', value, onChange }: SettingItemImageFileProps) {
    return (
        <SettingItem icon={icon} title={title} description={description} className={`image-file ${className}`}>
            <label className="value">
                {value && <img src={value} alt={title} />}
                <div className={`label ${value ? 'backdrop':''}`}>Select file</div>
                <input type="file" accept="image/*" onChange={e => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                        const fr = new FileReader();
                        fr.onload = e => {
                            if (e.target?.result) {
                                onChange(e.target.result as string);
                            } else {
                                store.dispatch({
                                    type: "ADD_NOTIFICATION",
                                    notification: {
                                        type: "error",
                                        message: "Failed to read the file"
                                    }
                                });
                                onChange(null);
                            }
                        }
                        fr.readAsDataURL(file);
                    } else {
                        onChange(null);
                    }
                }} />
            </label>
        </SettingItem>
    )
}