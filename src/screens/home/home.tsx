import React from "react";
import { connect } from "react-redux";
import { Navigate, Outlet, useMatch, useSearchParams } from "react-router-dom";
import { handleError, sendRequest } from "../../hub/request";
import { store, StoreState } from "../../store";
import HomePageChooseRoom from "./choose-room";
import './home.scss';
import './desktop.scss';
import { darkThemeMediaQuery } from "../..";

const HomePage = connect(({roomStates, appearanceSettings, allowDesktopMode}: StoreState)=>({roomStates, appearanceSettings, allowDesktopMode}))(function Home({roomStates, appearanceSettings, allowDesktopMode}: Pick<StoreState, 'roomStates'|'appearanceSettings'|'allowDesktopMode'>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const inAppearanceSettings = useMatch({path: "/settings/appearance", end: false})
    const isDesktopMode = searchParams.get('desktop') !== null;
    const [wallpaper, setWallpaper] = React.useState<string|null>(null);

    React.useEffect(() => { refreshRoomStates() }, []);
    
    React.useEffect(() => {
        if (isDesktopMode !== (!!document.fullscreenElement) && !inAppearanceSettings) {
            if (isDesktopMode)
                document.body.requestFullscreen({ navigationUI: "hide" });
            else
                document.exitFullscreen();
        }
        
        if (
            isDesktopMode &&
            (!localStorage.getItem('home_modules_wallpaper')) &&
            localStorage.getItem("home_modules_ever_shown_wallpaper_notification") !== 'true' &&
            (!inAppearanceSettings)
        ) {
            localStorage.setItem("home_modules_ever_shown_wallpaper_notification", 'true');
            store.dispatch({
                type: "ADD_NOTIFICATION",
                notification: {
                    message: "You can set a wallpaper to be shown here.",
                    type: "info",
                    timeout: 60000,
                    buttons: [
                        {
                            isPrimary: true,
                            label: "Appearance settings",
                            route: "/settings/appearance?field=desktop-wallpaper&desktop",
                            onClick() {
                                if(document.fullscreenElement)
                                    document.exitFullscreen();
                            },
                        }
                    ]
                }
            })
        }
    }, [isDesktopMode])

    React.useEffect(() => {
        if (isDesktopMode) {
            const update = () => {
                setWallpaper(`url(${localStorage.getItem(darkThemeMediaQuery.matches ?
                    "home_modules_wallpaper" :
                    "home_modules_wallpaper_dark")}`);
            }
            update();
            darkThemeMediaQuery.addEventListener("change", update);
            return () => darkThemeMediaQuery.removeEventListener("change", update);
        } else {
            setWallpaper(null);
        }
    }, [isDesktopMode])

    React.useEffect(() => {
        if(!allowDesktopMode)
            setSearchParams({});
    }, [allowDesktopMode, setSearchParams])

    if (roomStates && searchParams.has("redirect")) {
        return <Navigate to={searchParams.get("redirect")!} replace />
    }

    return (
        <main
            id="home"
            className={isDesktopMode ? 'desktop' : ''}
            style={wallpaper ? {backgroundImage: wallpaper} : {}}
    >
            <HomePageChooseRoom roomStates={roomStates} appearanceSettings={appearanceSettings} allowDesktopMode={allowDesktopMode} />
            {(!inAppearanceSettings) && <Outlet />}
        </main>
    )
})
export default HomePage;

export function refreshRoomStates() {
    function setRoomStates(states: StoreState["roomStates"]) {
        store.dispatch({
            type: 'SET_ROOM_STATES',
            states
        });
    }

    return sendRequest({
        type: "rooms.getRoomStates"
    }).then(res => {
        if (res.type === 'ok') {
            setRoomStates(Object.values(res.data.states));
        } else {
            handleError(res);
            setRoomStates(false);
        }
    }, err => {
        handleError(err);
        setRoomStates(false);
    });
}
