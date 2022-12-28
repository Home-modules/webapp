import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { useSearchParams } from "react-router-dom";
import { store } from "../../../store";
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
                    <div className="title">
                        <FontAwesomeIcon icon={faImage} /> Desktop mode wallpaper
                    </div>
                    <label className="value">
                        {wallpaperUrl && <img src={wallpaperUrl} alt="Wallpaper" />}
                        <span className="label">Select file</span>
                        <input type="file" accept="image/*" onChange={e => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                                const fr = new FileReader();
                                fr.onload = e => {
                                    if (e.target?.result) {
                                        localStorage.setItem('home_modules_wallpaper', e.target.result as string);
                                        setWallpaperUrl(e.target.result as string);
                                    } else {
                                        store.dispatch({
                                            type: "ADD_NOTIFICATION",
                                            notification: {
                                                type: "error",
                                                message: "Failed to read the file"
                                            }
                                        });
                                        localStorage.removeItem('home_modules_wallpaper');
                                        setWallpaperUrl(null);
                                    }
                                }
                                fr.readAsDataURL(file);
                            } else {
                                localStorage.removeItem('home_modules_wallpaper');
                                setWallpaperUrl(null);
                            }
                        }} />
                    </label>
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