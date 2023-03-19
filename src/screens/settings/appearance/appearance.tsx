import { faDesktop, faImage } from "@fortawesome/free-solid-svg-icons";
import React from "react"
import { connect } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { store, StoreState } from "../../../store";
import { SettingItemImageFile } from "../../../ui/settings/image-file";
import { SettingItemToggle } from "../../../ui/settings/toggle";
import HomePage from "../../home/home";
import './appearance.scss';

export const defaultAppearanceSettings: StoreState['appearanceSettings'] = {
    showDesktopModeButton: window.innerWidth > 600 // Disabled for mobile, enabled for desktop
}

export function getAppearanceSetting(name: keyof StoreState['appearanceSettings'], settings?: StoreState['appearanceSettings']) {
    if (!settings) settings = store.getState().appearanceSettings;
    return settings[name] === undefined ? defaultAppearanceSettings[name] : settings[name];
}

function AppearanceSettings({ appearanceSettings }: Pick<StoreState, 'appearanceSettings'>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentField = searchParams.get('field');
    const [wallpaperUrl, setWallpaperUrl] = React.useState(localStorage.getItem('home_modules_wallpaper'));

    return (
        <div id="settings-appearance">
            <div className="fields">
                <section
                    className={`setting show-desktop-mode-icon ${currentField === 'show-desktop-mode-icon' ? 'active' : ''}`}
                    onClick={() => setSearchParams({ field: 'show-desktop-mode-icon' })}
                    onFocusCapture={() => setSearchParams({ field: 'show-desktop-mode-icon' })}
                    onBlurCapture={()=> setSearchParams({})}
                >
                    <SettingItemToggle
                        title="Show desktop mode button"
                        description="Whether to show the desktop mode button in the home page"
                        icon={faDesktop}
                        state={getAppearanceSetting('showDesktopModeButton', appearanceSettings)}
                        onChange={value => store.dispatch({
                            type: "SET_APPEARANCE_SETTINGS",
                            settings: {showDesktopModeButton: value}
                        })}
                    />
                </section>
                <section
                    className={`setting desktop-wallpaper ${currentField === 'desktop-wallpaper' ? 'active' : ''}`}
                    onClick={() => setSearchParams({ field: 'desktop-wallpaper', desktop: '' })}
                    onFocusCapture={() => setSearchParams({ field: 'desktop-wallpaper', desktop: '' })}
                    onBlurCapture={()=> setSearchParams({})}
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
                            setSearchParams({ field: 'desktop-wallpaper', desktop: '' }); // This causes a re-render.
                        }}
                    />
                </section>

                <div className="rest" onClick={()=>setSearchParams({})}/>
            </div>

            <div className={`preview ${currentField || 'closed'}`}>
                {{
                    'show-desktop-mode-icon': (
                        <HomePage />
                    ),
                    'desktop-wallpaper': (
                        <HomePage />
                    ),
                    'default': (
                        <div className="placeholder">
                            Select a setting to preview
                        </div>
                    )
                }[currentField||'default']}
            </div>
        </div>
    )
}

const SettingsPageAppearance = connect(({ appearanceSettings }: StoreState) => ({ appearanceSettings }))(AppearanceSettings);
export default SettingsPageAppearance;