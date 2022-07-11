import React from "react";
import { connect } from "react-redux";
import { Outlet } from "react-router-dom";
import { handleError, sendRequest } from "../../hub/request";
import { store, StoreState } from "../../store";
import HomePageChooseRoom from "./choose-room";
import './home.scss';

const HomePage = connect(({roomStates}: StoreState)=>({roomStates}))(function Home({roomStates}: Pick<StoreState, 'roomStates'>) {
    const [currentRoomId, setCurrentRoomId] = React.useState<string>("");

    React.useEffect(()=>{refreshRoomStates()}, []);

    return (
        <main id="home">
            <HomePageChooseRoom roomStates={roomStates} currentRoomId={currentRoomId} onRoomSelected={setCurrentRoomId} />
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
