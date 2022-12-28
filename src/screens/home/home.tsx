import React from "react";
import { connect } from "react-redux";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { handleError, sendRequest } from "../../hub/request";
import { store, StoreState } from "../../store";
import HomePageChooseRoom from "./choose-room";
import './home.scss';
import './desktop.scss';

const HomePage = connect(({roomStates}: StoreState)=>({roomStates}))(function Home({roomStates}: Pick<StoreState, 'roomStates'>) {
    const [searchParams] = useSearchParams();
    const isDesktopMode = searchParams.get('desktop') !== null;

    React.useEffect(()=>{refreshRoomStates()}, []);

    if (roomStates && searchParams.has("redirect")) {
        return <Navigate to={searchParams.get("redirect")!} replace />
    }

    return (
        <main
            id="home"
            className={isDesktopMode ? 'desktop' : ''}
            style={isDesktopMode ? {backgroundImage: `url(${localStorage.getItem('home_modules_wallpaper')})`} : {}}
    >
            <HomePageChooseRoom roomStates={roomStates} />
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
