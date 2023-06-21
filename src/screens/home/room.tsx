import { faExclamationCircle, faPen, faPlug, faRotate } from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { handleError, sendRequest } from "../../hub/request";
import { store, StoreState } from "../../store";
import { IntermittentButton } from "../../ui/button";
import { refreshRoomStates } from "./home";
import './room.scss';
import React from "react";
import { HMApi } from "../../hub/api";
import ScrollView from "../../ui/scrollbar";
import { Device } from "./device";
import { ContextMenuItem } from "../../ui/context-menu";
import { PlaceHoldersArray } from "../../ui/placeholders";
import { SwipeableProps, useSwipeable } from "react-swipeable";
import { useNavigate } from "react-router-dom";

function swipeableOptions(
    roomStates: StoreState['roomStates'],
    roomId: string | undefined,
    navigate: ReturnType<typeof useNavigate>,
    searchParams: ReturnType<typeof useSearchParams>[0],
): SwipeableProps {
    return {
        onSwipedLeft() {
            if (searchParams.get("desktop") !== null) return;
            if (!roomStates) return;
            const i = roomStates.findIndex(r => r.id === roomId);
            if (i === -1) return;
            const nextRoom = roomStates[i + 1];
            if (!nextRoom) return;
            navigate("/home/" + nextRoom.id);
        },
        onSwipedRight() {
            if (searchParams.get("desktop") !== null) return;
            if (!roomStates) return;
            const i = roomStates.findIndex(r => r.id === roomId);
            if (i === -1) return;
            if (i === 0) {
                navigate("/home");
                return;
            }
            const prevRoom = roomStates[i - 1];
            if (!prevRoom) return;
            navigate("/home/" + prevRoom.id);
        }
    };
}

const HomePageRoom = connect(({roomStates}: StoreState)=>({roomStates}))(function Room({roomStates}: Pick<StoreState, 'roomStates'>) {
    const {roomId} = useParams();
    const callbacks = useSwipeable(swipeableOptions(roomStates, roomId, useNavigate(), useSearchParams()[0]))

    if(!roomId) return (
        <Favorites />
    )

    if((!roomStates)) {
        return <Navigate to={`/home?redirect=/home/${roomId}`} />
    }
    const state = roomStates.find(s=> s.id === roomId);
    if(!state) {
        return <Navigate to="/home" />
    }

    if (state.disabled) {
        const isRestarting = state.retries < state.maxRetries;
        return (
            <div className="devices disabled" {...callbacks}>
                <FontAwesomeIcon icon={faExclamationCircle} className="error" />
                <h1>This room has been disabled because of a fatal error</h1>
                <p>{state.error}</p>
                {isRestarting ? (
                    <p>Restarting automatically (try {state.retries + 1} out of {state.maxRetries})</p>
                ) : (
                    state.retries === state.maxRetries ? (
                        <p>{state.retries} automatic restarts failed</p>
                    ) : null
                )}
                <div className="actions">
                    <IntermittentButton
                        onClick={async () => {
                            await sendRequest({
                                type: 'rooms.restartRoom',
                                id: roomId
                            }).catch(handleError);
                            await refreshRoomStates();
                        }}
                        primary
                        disabled={isRestarting}
                    >
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
    function setStates(states: HMApi.T.DeviceState[] | false | undefined) {
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
    function setStates(states: HMApi.T.DeviceState[] | false | undefined) {
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

const Devices = connect(({deviceStates, roomStates}: StoreState)=>({deviceStates, roomStates}))(function Devices({roomState, deviceStates, roomStates}: DevicesProps & Pick<StoreState, 'deviceStates'|'roomStates'>) {
    const thisRoomDeviceStates = deviceStates[roomState.id];

    React.useEffect(() => { refreshDeviceStates(roomState.id) }, [roomState.id]);

    const callbacks = useSwipeable(swipeableOptions(roomStates, roomState.id, useNavigate(), useSearchParams()[0]))

    return (
        <PlaceHoldersArray
            className="devices"
            items={thisRoomDeviceStates}
            placeholderProps={callbacks}
            Wrapper={states => (
                //@ts-ignore
                <ScrollView
                    className="devices"
                    onContextMenu={e => {
                        e.preventDefault();
                        store.dispatch({
                            type: 'SET_CONTEXT_MENU',
                            contextMenu: {
                                x: e.clientX,
                                y: e.clientY,
                                children: [
                                    <ContextMenuItem key={0}
                                        icon={faRotate}
                                        onClick={() => refreshDeviceStates(roomState.id)}
                                    >
                                        Refresh
                                    </ContextMenuItem>,
                                    <ContextMenuItem key={1}
                                        icon={faPen}
                                        href={`/settings/devices/${roomState.id}`}
                                    >
                                        Edit devices
                                    </ContextMenuItem>
                                ]
                            }
                        })
                    }}
                >
                    <div {...callbacks}>
                        {states.map(state => (
                            <Device key={state.id} state={state} isInFavorites={false} />
                        ))}
                    </div>
                </ScrollView>
            )}
            emptyPlaceholder={<>
                <FontAwesomeIcon icon={faPlug} className="placeholder" />
                <h1>No devices</h1>
                <p>Add devices to <em>{roomState.name}</em> in the settings.</p>
                <div className="actions">
                    <Link to={`/settings/devices/${roomState.id}`} className="button primary">
                        Edit devices
                    </Link>
                </div>
            </>}
            errorPlaceholder="There was an error loading the devices"
            loadingPlaceholder="Loading devices..."
        />
    );
})

const Favorites = connect(({favoriteDeviceStates, roomStates}: StoreState)=>({favoriteDeviceStates, roomStates}))(function Favorites({favoriteDeviceStates, roomStates}: Pick<StoreState, 'favoriteDeviceStates'|'roomStates'>) {
    React.useEffect(()=> {refreshFavoriteDeviceStates()}, []);

    const navigate = useNavigate(), searchParams = useSearchParams()[0];
    const callbacks = useSwipeable({
        onSwipedLeft() {
            if (searchParams.get("desktop") !== null) return;
            if (!roomStates) return;
            const firstRoom = roomStates[0];
            if (!firstRoom) return;
            navigate("/home/" + firstRoom.id);
        }
    })

    return (
        <PlaceHoldersArray
            className="devices favorites"
            items={favoriteDeviceStates}
            placeholderProps={callbacks}
            Wrapper={states => (
                <ScrollView
                    className="devices"
                    onContextMenu={e => {
                        e.preventDefault();
                        store.dispatch({
                            type: 'SET_CONTEXT_MENU',
                            contextMenu: {
                                x: e.clientX,
                                y: e.clientY,
                                children: [
                                    <ContextMenuItem key={0}
                                        icon={faRotate}
                                        onClick={refreshFavoriteDeviceStates}
                                    >
                                        Refresh
                                    </ContextMenuItem>
                                ]
                            }
                        })
                    }}
                >
                    <div {...callbacks}>
                        {states.map(state => (
                            <Device
                                key={state.id}
                                state={state}
                                isInFavorites
                                roomName={roomStates ? roomStates.find(r => r.id === state.roomId)?.name : undefined}
                            />
                        ))}
                    </div>
                </ScrollView>
            )}
            emptyPlaceholder={<>
                <FontAwesomeIcon icon={farStar} className="placeholder" />
                <h1>No favorite devices</h1>
                <p>
                    Add devices to this list by {navigator.maxTouchPoints ? 'long pressing' : 'right clicking'} a device and selecting the <FontAwesomeIcon icon={farStar} /> button.
                </p>
            </>}
            loadingPlaceholder="Loading devices..."
            errorPlaceholder="There was an error loading the devices"
        />
    );
});
