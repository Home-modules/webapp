import { faChevronRight, faExclamationCircle, faPlug, fas, faTimesCircle, faStar as fasStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import { handleError, sendRequest } from "../../hub/request";
import { store, StoreState } from "../../store";
import { IntermittentButton } from "../../ui/button";
import { refreshRoomStates } from "./home";
import './room.scss';
import React from "react";
import { HMApi } from "../../hub/api";
import ScrollView from "../../ui/scrollbar";
import { ContextMenuItem } from "../../ui/context-menu";

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
                <FontAwesomeIcon icon={faExclamationCircle} className="error" />
                <h1>This room has been disabled because of a fatal error</h1>
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

    return <Devices roomState={state} />
});
export default HomePageRoom;

export async function refreshDeviceStates(roomId: string) {
    function setStates(states: HMApi.DeviceState[] | false | undefined) {
        store.dispatch({
            type: 'SET_DEVICE_STATES',
            roomId: roomId,
            states
        });
    }

    return sendRequest({
        type: 'devices.getDeviceStates',
        roomId: roomId
    }).then(res => {
        if (res.type === 'ok') {
            setStates(Object.values(res.data.states));
            
        } else {
            handleError(res);
            setStates(false);
        }
    }, err => {
        handleError(err);
        setStates(false);
    })
}

export async function refreshFavoriteDeviceStates() {
    function setStates(states: HMApi.DeviceState[] | false | undefined) {
        store.dispatch({
            type: 'SET_FAVORITE_DEVICE_STATES',
            states
        });
    }

    return sendRequest({
        type: 'devices.getFavoriteDeviceStates',
    }).then(res => {
        if (res.type === 'ok') {
            setStates(Object.values(res.data.states));
            
        } else {
            handleError(res);
            setStates(false);
        }
    }, err => {
        handleError(err);
        setStates(false);
    })
}

type DevicesProps = {
    roomState: {
        disabled: false;
        id: string;
        name: string;
        icon: "living-room" | "kitchen" | "bedroom" | "bathroom" | "other";
    };
}

const Devices = connect(({deviceStates}: StoreState)=>({deviceStates}))(function Devices({roomState, deviceStates}: DevicesProps & Pick<StoreState, 'deviceStates'>) {
    const thisRoomDeviceStates = deviceStates[roomState.id];

    React.useEffect(()=> {refreshDeviceStates(roomState.id)}, [roomState.id]);

    return thisRoomDeviceStates instanceof Array ? (
        thisRoomDeviceStates.length ? (
            <ScrollView className="devices">
                {thisRoomDeviceStates.map(state => (
                    <Device key={state.id} state={state} isInFavorites={false}/>
                ))}
            </ScrollView>
        ) : (
            <div className="devices empty">
                <FontAwesomeIcon icon={faPlug} className="placeholder" />
                <h1>No devices</h1>
                <p>Add devices to <em>{roomState.name}</em> in the settings.</p>
                <div className="actions">
                    <Link to={`/settings/rooms/${roomState.id}/devices`} className="button primary">
                        Edit devices
                    </Link>
                </div>
            </div>
        )
    ) : (
        thisRoomDeviceStates === undefined ? (
            <div className="devices loading">
                <div className="circle" />
                Loading devices...
            </div>
        ) : (
            <div className="devices error">
                <FontAwesomeIcon icon={faTimesCircle} />
                There was an error loading the devices
            </div>
        )
    )
})

const Favorites = connect(({favoriteDeviceStates, roomStates}: StoreState)=>({favoriteDeviceStates, roomStates}))(function Favorites({favoriteDeviceStates, roomStates}: Pick<StoreState, 'favoriteDeviceStates'|'roomStates'>) {
    React.useEffect(()=> {refreshFavoriteDeviceStates()}, []);

    return favoriteDeviceStates instanceof Array ? (
        favoriteDeviceStates.length ? (
            <ScrollView className="devices">
                {favoriteDeviceStates.map(state => (
                    <Device 
                        key={state.id} 
                        state={state} 
                        isInFavorites 
                        roomName={roomStates? roomStates.find(r=> r.id === state.roomId)?.name : undefined} 
                    />
                ))}
            </ScrollView>
        ) : (
            <div className="devices favorites empty">
                <FontAwesomeIcon icon={farStar} className="placeholder" />
                <h1>No favorite devices</h1>
                <p>
                    Add devices to this list by {navigator.maxTouchPoints ? 'long pressing' : 'right clicking'} a device and selecting the <FontAwesomeIcon icon={farStar} /> button.
                </p>
            </div>
        )
    ) : (
        favoriteDeviceStates === undefined ? (
            <div className="devices loading">
                <div className="circle" />
                Loading devices...
            </div>
        ) : (
            <div className="devices error">
                <FontAwesomeIcon icon={faTimesCircle} />
                There was an error loading the devices
            </div>
        )
    )
});

type DeviceProps = {
    state: HMApi.DeviceState;
    isInFavorites: boolean;
    roomName?: string;
};

function Device({state, isInFavorites, roomName}: DeviceProps) {
    const [intermittent, setIntermittent] = React.useState(false);

    return (
        <button 
            className={`device ${state.mainToggleState?'active':''} ${intermittent?'intermittent':''} ${state.clickable?'clickable':''} ${state.activeColor||''}`} 
            onClick={()=> {
                if(!state.clickable) return;
                if(state.hasMainToggle) {
                    setIntermittent(true);
                    sendRequest({
                        type: 'devices.toggleDeviceMainToggle',
                        roomId: state.roomId,
                        id: state.id
                    }).catch((err: {type: "error", error: HMApi.RequestError<HMApi.RequestToggleDeviceMainToggle>})=> {
                        if(err.error.message === 'ROOM_DISABLED') {
                            refreshRoomStates(); // refresh room states to show the room is disabled
                        }
                    }).finally(async()=> {
                        if(isInFavorites) {
                            await refreshFavoriteDeviceStates();
                        } else {
                            await refreshDeviceStates(state.roomId);
                        }
                        setIntermittent(false);
                    });
                }
            }}
            onContextMenu={e=> {
                e.preventDefault();
                store.dispatch({
                    type: 'SET_CONTEXT_MENU',
                    contextMenu: {
                        x: e.clientX,
                        y: e.clientY,
                        children: [
                            <ContextMenuItem key={0}
                                icon={state.isFavorite ? fasStar : farStar}
                                onClick={()=> {
                                    sendRequest({
                                        type: 'devices.toggleDeviceIsFavorite',
                                        roomId: state.roomId,
                                        id: state.id,
                                        isFavorite: !state.isFavorite
                                    }).catch(handleError).finally(async()=> {
                                        await refreshFavoriteDeviceStates();
                                    });
                                }}
                            >
                                {state.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            </ContextMenuItem>
                        ]
                    }
                })
            }}
            disabled={intermittent}
        >
            {state.iconText ? 
                <div className={`icon-text ${state.iconColor||''}`}>{state.iconText}</div> :
                <FontAwesomeIcon icon={fas['fa'+(state.icon || state.type.icon)]} className={state.iconColor||''} />}
            
            <div className="name">
                {isInFavorites ? 
                    <>{roomName} <FontAwesomeIcon icon={faChevronRight} /> {state.name}</> : 
                    state.name
                }
            </div>
            <div className="state">
                {state.statusText}
            </div>
        </button>
    )
}