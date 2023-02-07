import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { useSearchParams } from "react-router-dom";
import { store } from "../../../store";
import { SettingItemImageFile } from "../../../ui/settings/image-file";
import HomePage from "../../home/home";
import './appearance.scss';

export default function SettingsPageAppearance() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentField = searchParams.get('field');
    const [wallpaperUrl, setWallpaperUrl] = React.useState(localStorage.getItem('home_modules_wallpaper'));

    return (
        <div id="settings-appearance">
            <div className="fields">
                <section
                    className={`setting desktop-wallpaper ${currentField === 'desktop-wallpaper' ? 'active' : ''}`}
                    onClick={() => setSearchParams({ field: 'desktop-wallpaper', desktop: '' })}
                >
                    <SettingItemImageFile
                        title="Desktop mode wallpaper"
                        icon={faImage}
                        value={wallpaperUrl}
                        onChange={value => {
                            setWallpaperUrl(value);
                            if(value)
                                localStorage.setItem('home_modules_wallpaper', value);
                            else 
                            localStorage.removeItem('home_modules_wallpaper');
                        }}
                    />
                </section>

                <div className="rest"/>
            </div>

            <div className={`preview ${currentField || 'closed'}`}>
                {{
                    'desktop-wallpaper': (
                        <HomePage />
                    )
                }[currentField||'']}
            </div>
        </div>
    )
}