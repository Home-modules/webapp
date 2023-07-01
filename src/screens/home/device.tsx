import { faChevronRight, faPen, faRotateRight, fas, faStar as fasStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleError, sendRequest } from "../../hub/request";
import { store } from "../../store";
import { refreshRoomStates } from "./home";
import React from "react";
import { HMApi } from "../../hub/api";
import { ContextMenuItem } from "../../ui/context-menu";
import promiseTimeout from "../../utils/promise-timeout";
import { refreshFavoriteDeviceStates, refreshDeviceStates } from "./room";
import './device.scss';
import DeviceInteractions, { DeviceInteraction, getSendActionF } from "./device-interactions/interactions";

type DeviceProps = {
    state: HMApi.T.DeviceState;
    isInFavorites: boolean;
    roomName?: string;
};

export function Device({ state, isInFavorites, roomName }: DeviceProps) {
    const [intermittent, setIntermittent] = React.useState(false);

    let defaultInteraction: string | undefined, defaultInteraction2: string | undefined;
    if (state.type.defaultInteraction?.includes('+')) {
        [defaultInteraction2, defaultInteraction] = state.type.defaultInteraction.split('+')
    } else {
        if (state.type.defaultInteraction && state.type.interactions[state.type.defaultInteraction].type === 'twoButtonNumber') {
            defaultInteraction2 = state.type.defaultInteraction;
        } else {
            defaultInteraction = state.type.defaultInteraction;
        }
    }

    if(state.disabled) {
        return <DisabledDevice state={state} roomName={roomName} isInFavorites={isInFavorites} />;
    }
    
    function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        const element =
            e.key === 'ArrowLeft' ?
                (e.target as HTMLElement).previousElementSibling :
            e.key === 'ArrowRight' ?
                (e.target as HTMLElement).nextElementSibling :
            null;
        
        if (element?.tagName === 'BUTTON') {
            (element as HTMLElement).focus();
        }
    }

    const startSliderStream = () => ({
        type: "devices.interactions.initSliderLiveValue",
        deviceId: state.id,
        roomId: state.roomId,
        interactionId: defaultInteraction!,
    } as const);
    
    return (
        <button
            className={`device ${state.mainToggleState ? 'active' : ''} ${intermittent ? 'intermittent' : ''} ${state.clickable ? 'clickable' : ''} ${state.activeColor || ''}`}
            onKeyDown={onKeyDown}
            onClick={() => {
                if (!state.clickable)
                    return;
                if (state.hasMainToggle) {
                    promiseTimeout(sendRequest({
                        type: 'devices.toggleDeviceMainToggle',
                        roomId: state.roomId,
                        id: state.id
                    }).catch((err: { type: "error"; error: HMApi.Error<HMApi.Request.Devices.ToggleDeviceMainToggle>; }) => {
                        if (err.error.message === 'ROOM_DISABLED') {
                            refreshRoomStates(); // refresh room states to show the room is disabled
                        }
                    }).finally(async () => {
                        if (isInFavorites) {
                            await refreshFavoriteDeviceStates();
                        } else {
                            await refreshDeviceStates(state.roomId);
                        }
                        setIntermittent(false);
                    }), 100, () => setIntermittent(true));
                }
            }}
            onContextMenu={e => {
                e.preventDefault();
                e.stopPropagation();
                store.dispatch({
                    type: 'SET_CONTEXT_MENU',
                    contextMenu: {
                        x: e.clientX,
                        y: e.clientY,
                        children: (
                            <DeviceInteractions
                                roomId={state.roomId}
                                deviceId={state.id}
                                isInFavorites={isInFavorites}
                            >
                                <ContextMenuItem key={0}
                                    icon={state.isFavorite ? fasStar : farStar}
                                    onClick={() => {
                                        sendRequest({
                                            type: 'devices.toggleDeviceIsFavorite',
                                            roomId: state.roomId,
                                            id: state.id,
                                            isFavorite: !state.isFavorite
                                        }).then(()=> {
                                            store.dispatch({
                                                type: 'ADD_NOTIFICATION',
                                                notification: {
                                                    type: 'success',
                                                    message: state.isFavorite ? 'Removed from favorites' : 'Added to favorites'
                                                }
                                            });
                                        }, handleError).finally(async () => {
                                            if (isInFavorites) {
                                                await refreshFavoriteDeviceStates();
                                            } else {
                                                await refreshDeviceStates(state.roomId);
                                            }
                                        });
                                    }}
                                >
                                    {state.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                </ContextMenuItem>
                                <ContextMenuItem key={1}
                                    icon={faPen}
                                    href={`/settings/devices/${state.roomId}/edit/${state.id}`}
                                >
                                    Edit
                                    </ContextMenuItem>
                            </DeviceInteractions>
                        )
                    }
                });
            }}
            disabled={intermittent}
        >
            {defaultInteraction2 ? (
                <DeviceInteraction
                    interaction={state.type.interactions[defaultInteraction2]}
                    sendAction={getSendActionF(state, defaultInteraction2, isInFavorites)}
                    state={state.interactions[defaultInteraction2]!}
                    isDefault
                    startSliderStream={startSliderStream}
                />
            ) : (
                state.iconText ?
                    <div className={`icon-text ${state.iconColor || ''}`}>{state.iconText}</div> :
                    <FontAwesomeIcon icon={fas['fa' + (state.icon || state.type.icon)]} className={state.iconColor || ''} />
            )}

            <div className="name">
                {isInFavorites ?
                    <>{roomName} <FontAwesomeIcon icon={faChevronRight} /> {state.name}</> :
                    state.name}
            </div>
            <div className="default-interaction" onClick={e => {
                if (defaultInteraction && state.type.interactions[defaultInteraction].type !== 'label') {
                    e.stopPropagation();
                }
            }}>
                {defaultInteraction ? (
                    <DeviceInteraction
                        interaction={state.type.interactions[defaultInteraction]}
                        sendAction={getSendActionF(state, defaultInteraction, isInFavorites)}
                        state={state.interactions[defaultInteraction]!}
                        isDefault
                        startSliderStream={startSliderStream}
                    />
                ) : (
                    <div className="label">
                        {state.hasMainToggle ? (state.mainToggleState ? "ON" : "OFF") : ' '}
                    </div>
                )}
            </div>
        </button>
    );
}

function DisabledDevice({ state, isInFavorites, roomName }: DeviceProps) {
    function showContextMenu(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();
        store.dispatch({
            type: 'SET_CONTEXT_MENU',
            contextMenu: {
                x: e.clientX,
                y: e.clientY,
                children: [
                    <ContextMenuItem key={0}
                        icon={faRotateRight}
                        onClick={async() => {
                            await sendRequest({
                                type: 'devices.restartDevice',
                                roomId: state.roomId,
                                id: state.id
                            }).catch(handleError);
                            if(isInFavorites) {
                                await refreshFavoriteDeviceStates();
                            } else {
                                await refreshDeviceStates(state.roomId);
                            }
                        }}
                    >
                        Restart device
                    </ContextMenuItem>,
                    <ContextMenuItem key={1}
                        icon={faPen}
                        href={`/settings/devices/${state.roomId}/edit/${state.id}`}
                    >
                        Edit device
                    </ContextMenuItem>
                ]
            }
        });
    }

    return (
        <button
            className="device clickable disabled" // Active, clickable and color are ignored
            onContextMenu={showContextMenu}
            onClick={showContextMenu}
        >
            <FontAwesomeIcon icon={fas['fa' + state.type.icon] /* Current icon and icon text are ignored */} />
            <div className="name">
                {isInFavorites ?
                    <>{roomName} <FontAwesomeIcon icon={faChevronRight} /> {state.name}</> :
                    state.name}
            </div>
            <div className="state">
                ERROR
            </div>
        </button>
    );
}