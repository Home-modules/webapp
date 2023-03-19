import React from "react";
import { connect } from "react-redux";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { handleError, sendRequest } from "../../hub/request";
import { store, StoreState } from "../../store";
import HomePageChooseRoom from "./choose-room";
import './home.scss';
import './desktop.scss';

const HomePage = connect(({roomStates, appearanceSettings}: StoreState)=>({roomStates, appearanceSettings}))(function Home({roomStates, appearanceSettings}: Pick<StoreState, 'roomStates'|'appearanceSettings'>) {
    const [searchParams] = useSearchParams();
    const isDesktopMode = searchParams.get('desktop') !== null;

    React.useEffect(() => { refreshRoomStates() }, []);
    
    React.useEffect(() => {
        if (
            isDesktopMode &&
            (!localStorage.getItem('home_modules_wallpaper')) &&
            localStorage.getItem("home_modules_ever_shown_wallpaper_notification") !== 'true' &&
            window.location.pathname !== "/settings/appearance"
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

    if (roomStates && searchParams.has("redirect")) {
        return <Navigate to={searchParams.get("redirect")!} replace />
    }

    return (
        <main
            id="home"
            className={isDesktopMode ? 'desktop' : ''}
            style={isDesktopMode ? {backgroundImage: `url(${localStorage.getItem('home_modules_wallpaper')})`} : {}}
    >
            <HomePageChooseRoom roomStates={roomStates} appearanceSettings={appearanceSettings} />
            <Outlet />
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
