import { faCircle as fasCircle, faDesktop, faImage, faCircleHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { faCircle as farCircle } from "@fortawesome/free-regular-svg-icons";
import React from "react"
import { connect } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { store, StoreState } from "../../../store";
import { SettingItemImageFile } from "../../../ui/settings/image-file";
import { SettingItemToggle } from "../../../ui/settings/toggle";
import HomePage from "../../home/home";
import './appearance.scss';
import { SettingItemIconSelect } from "../../../ui/settings/icon-select";
import { darkThemeMediaQuery, updateTheme } from "../../..";

export const defaultAppearanceSettings: StoreState['appearanceSettings'] = {
    showDesktopModeButton: window.innerWidth > 600, // Disabled for mobile, enabled for desktop
    colorTheme: 'system',
}

export function getAppearanceSetting<T extends keyof StoreState['appearanceSettings']>(name: T, settings?: StoreState['appearanceSettings']): StoreState['appearanceSettings'][T] {
    if (!settings) settings = store.getState().appearanceSettings;
    return settings[name] === undefined ? defaultAppearanceSettings[name] : settings[name];
}

function AppearanceSettings({ appearanceSettings, allowDesktopMode }: Pick<StoreState, 'appearanceSettings'|'allowDesktopMode'>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentField = searchParams.get('field');
    const [wallpaperUrl, setWallpaperUrl] = React.useState(localStorage.getItem('home_modules_wallpaper'));

    const theme = getAppearanceSetting('colorTheme', appearanceSettings);
    const [systemThemeIsDark, setSystemThemeIsDark] = React.useState(darkThemeMediaQuery.matches);
    const isDarkNow = theme === 'system' ? systemThemeIsDark : theme === 'dark';
    React.useEffect(() => {
        const onChange = () => setSystemThemeIsDark(darkThemeMediaQuery.matches);
        darkThemeMediaQuery.addEventListener('change', onChange);

        return () => darkThemeMediaQuery.removeEventListener('change', onChange);
    }, []);
    React.useEffect(() => {
        updateTheme();
    }, [isDarkNow]);

    return (
        <div id="settings-appearance">
            <div className="fields">
                <section
                    className={`setting color-theme ${currentField === 'color-theme' ? 'active' : ''}`}
                    onClick={() => setSearchParams({ field: 'color-theme' })}
                    onFocusCapture={() => setSearchParams({ field: 'color-theme' })}
                >
                    <SettingItemIconSelect
                        title="Color theme"
                        description={({
                            'system': 'System settings', 'dark': 'Dark', 'light': 'Light'
                        } as const)[theme]}
                        icon={faDesktop}
                        icons={[
                            { ...(isDarkNow ? fasCircle : farCircle), iconName: "circle-up" },
                            { ...(isDarkNow ? farCircle : fasCircle), iconName: "circle-down" },
                            faCircleHalfStroke
                        ]}
                        value={({
                            'system': 'circle-half-stroke', 'dark': 'circle-down', 'light': 'circle-up'
                        } as const)[theme]}
                        onChange={value => store.dispatch({
                            type: "SET_APPEARANCE_SETTINGS",
                            settings: {
                                colorTheme: ({
                                    'circle-half-stroke': 'system', 'circle-down': 'dark', 'circle-up': 'light'
                                } as const)[value as 'circle-half-stroke' | 'circle-up' | 'circle-down']
                            }
                        })}
                    />
                </section>

                {allowDesktopMode && <>
                    <section
                        className={`setting show-desktop-mode-icon ${currentField === 'show-desktop-mode-icon' ? 'active' : ''}`}
                        onClick={() => setSearchParams({ field: 'show-desktop-mode-icon' })}
                        onFocusCapture={() => setSearchParams({ field: 'show-desktop-mode-icon' })}
                        onBlurCapture={() => setSearchParams({})}
                    >
                        <SettingItemToggle
                            title="Show desktop mode button"
                            description="Whether to show the desktop mode button in the home page"
                            icon={faDesktop}
                            state={getAppearanceSetting('showDesktopModeButton', appearanceSettings)}
                            onChange={value => store.dispatch({
                                type: "SET_APPEARANCE_SETTINGS",
                                settings: { showDesktopModeButton: value }
                            })}
                        />
                    </section>
                    <section
                        className={`setting desktop-wallpaper ${currentField === 'desktop-wallpaper' ? 'active' : ''}`}
                        onClick={() => setSearchParams({ field: 'desktop-wallpaper', desktop: '' })}
                        onFocusCapture={() => setSearchParams({ field: 'desktop-wallpaper', desktop: '' })}
                        onBlurCapture={() => setSearchParams({})}
                    >
                        <SettingItemImageFile
                            title="Desktop mode wallpaper"
                            icon={faImage}
                            value={wallpaperUrl}
                            onChange={value => {
                                setWallpaperUrl(value);
                                if (value)
                                    localStorage.setItem('home_modules_wallpaper', value);
                                else
                                    localStorage.removeItem('home_modules_wallpaper');
                                setSearchParams({ field: 'desktop-wallpaper', desktop: '' }); // This causes a re-render.
                            }}
                        />
                    </section>
                </>}

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

const SettingsPageAppearance = connect(({ appearanceSettings, allowDesktopMode }: StoreState) => ({ appearanceSettings, allowDesktopMode }))(AppearanceSettings);
export default SettingsPageAppearance;