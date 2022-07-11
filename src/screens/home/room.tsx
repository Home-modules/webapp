import { faExclamationCircle, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import { handleError, sendRequest } from "../../hub/request";
import { StoreState } from "../../store";
import { IntermittentButton } from "../../ui/button";
import { refreshRoomStates } from "./home";
import './room.scss';

const HomePageRoom = connect(({roomStates}: StoreState)=>({roomStates}))(function Room({roomStates}: Pick<StoreState, 'roomStates'>) {
    const {roomId} = useParams();

    if(!roomId) return (
        <Favorites />
    )

    if((!roomStates)) {
        return <Navigate to="/home" />
    }
    const state = roomStates.find(s=> s.id === roomId);
    if(!state) {
        return <Navigate to="/home" />
    }

    if(state.disabled) {
        return (
            <div className="devices disabled">
                <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
                <h1 className="title">This room has been disabled because of a fatal error</h1>
                <p>{state.error}</p>
                <div className="actions">
                    <IntermittentButton onClick={async()=> {
                        await sendRequest({
                            type: 'rooms.restartRoom',
                            id: roomId
                        }).catch(handleError);
                        await refreshRoomStates();
                    }} primary>
                        Restart room
                    </IntermittentButton>
                    <Link to={`/settings/rooms/${roomId}/edit`} className="button">
                        Edit room
                    </Link>
                </div>
            </div>
        )
    }

    return <></>
});
export default HomePageRoom;

function Favorites() {
    return (
        <div className="devices favorites empty">
            <h1 className="title">No favorite devices</h1>
            <p>
                Add devices to this list by {navigator.maxTouchPoints ? 'long pressing' : 'right clicking'} a device and selecting the <FontAwesomeIcon icon={faStar} /> button.
            </p>
        </div>
    )
}