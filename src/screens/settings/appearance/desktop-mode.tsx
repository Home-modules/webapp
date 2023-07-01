import { connect } from "react-redux";
import { StoreState, store } from "../../../store";
import { Link, useSearchParams } from "react-router-dom";
import React from "react";
import { SettingItemToggle } from "../../../ui/settings/toggle";
import { faChevronLeft, faDesktop, faImage } from "@fortawesome/free-solid-svg-icons";
import { getAppearanceSetting } from "./appearance";
import { SettingItemImageFile } from "../../../ui/settings/image-file";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AppearanceSettingsDesktopMode({ appearanceSettings }: Pick<StoreState, 'appearanceSettings' | 'allowDesktopMode'>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentField = searchParams.get('field');
    const [wallpaperUrl, setWallpaperUrl] = React.useState(localStorage.getItem('home_modules_wallpaper'));
    const [wallpaperUrlDark, setWallpaperUrlDark] = React.useState(localStorage.getItem('home_modules_wallpaper_dark'));
    
    return (
        <div className="fields sub">
            <Link to="..">
                <FontAwesomeIcon icon={faChevronLeft} />
                <div className="title">Desktop mode</div>
            </Link>
            <section
                className={`setting show-desktop-mode-icon ${currentField === 'show-desktop-mode-icon' ? 'active' : ''}`}
                onClick={() => setSearchParams({ field: 'show-desktop-mode-icon' })}
                onFocusCapture={() => setSearchParams({ field: 'show-desktop-mode-icon' })}
                onBlurCapture={() => setSearchParams({})}
            >
                <SettingItemToggle
                    title="Show button"
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
                    title="Wallpaper"
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
            {wallpaperUrl && (
                <section
                    className={`setting desktop-wallpaper ${currentField === 'desktop-wallpaper' ? 'active' : ''}`}
                    onClick={() => setSearchParams({ field: 'desktop-wallpaper', desktop: '' })}
                    onFocusCapture={() => setSearchParams({ field: 'desktop-wallpaper', desktop: '' })}
                    onBlurCapture={() => setSearchParams({})}
                >
                    <SettingItemImageFile
                        title="Dark mode wallpaper"
                        description={wallpaperUrlDark ? undefined : "Using default wallpaper"}
                        icon={faImage}
                        value={wallpaperUrlDark}
                        onChange={value => {
                            setWallpaperUrlDark(value);
                            if (value)
                                localStorage.setItem('home_modules_wallpaper_dark', value);
                            else
                                localStorage.removeItem('home_modules_wallpaper_dark');
                            setSearchParams({ field: 'desktop-wallpaper', desktop: '' }); // This causes a re-render.
                        }}
                    />
                </section>
            )}

            <div className="rest" onClick={()=>setSearchParams({})}/>
        </div>
    )
}

const SettingsPageAppearanceDesktopMode = connect(({ appearanceSettings, allowDesktopMode }: StoreState) => ({ appearanceSettings, allowDesktopMode }))(AppearanceSettingsDesktopMode);
export default SettingsPageAppearanceDesktopMode;