import { faStar, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import { HMApi } from "../../hub/api";
import ScrollView from "../../ui/scrollbar";
import { roomIcons } from "../settings/rooms/rooms";
import './choose-room.scss';

export type HomePageChooseRoomProps = {
    roomStates: HMApi.RoomState[] | undefined | false,
    currentRoomId: string,
    onRoomSelected: (roomId: string) => void
}

export default function HomePageChooseRoom({ roomStates, currentRoomId, onRoomSelected }: HomePageChooseRoomProps) {
    function navigated(e: React.MouseEvent<HTMLAnchorElement>) {
        e.currentTarget.scrollIntoView({
            inline: 'center',
            block: 'center',
            behavior: 'smooth'
        });
    }

    return (
        <ScrollView className={`choose-room ${roomStates===undefined ? 'loading':''} ${roomStates===false ? 'error':''}`} tagName="nav">
            {roomStates instanceof Array ? <>
                <NavLink 
                    to="/home" 
                    className={({isActive}) => `${isActive ? 'active' : ''} favorites`}
                    end
                    onClick={navigated}
                >
                    <FontAwesomeIcon icon={faStar} />
                    <span>
                        Favorites
                    </span>
                </NavLink>
                {roomStates.map(roomState => (
                    <NavLink 
                        key={roomState.id} 
                        to={`/home/${roomState.id}`} 
                        className={({isActive}) => `${isActive ? 'active' : ''} ${roomState.disabled?'disabled':''}`}
                        onClick={navigated}
                    >
                        <FontAwesomeIcon icon={roomIcons[roomState.icon]} />
                        <span>
                            {roomState.name}
                        </span>
                    </NavLink>
                ))}
            </> : (
                roomStates === undefined ? <>
                    <div className="circle" />
                    Loading rooms...
                </> : <>
                    <FontAwesomeIcon icon={faTimesCircle} />
                    There was an error loading the rooms
                </>
            ) }
        </ScrollView>
    );
}