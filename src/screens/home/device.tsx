import { faChevronRight, fas, faStar as fasStar } from "@fortawesome/free-solid-svg-icons";
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

type DeviceProps = {
    state: HMApi.DeviceState;
    isInFavorites: boolean;
    roomName?: string;
};

export function Device({ state, isInFavorites, roomName }: DeviceProps) {
    const [intermittent, setIntermittent] = React.useState(false);

    return (
        <button
            className={`device ${state.mainToggleState ? 'active' : ''} ${intermittent ? 'intermittent' : ''} ${state.clickable ? 'clickable' : ''} ${state.activeColor || ''}`}
            onClick={() => {
                if (!state.clickable)
                    return;
                if (state.hasMainToggle) {
                    promiseTimeout(sendRequest({
                        type: 'devices.toggleDeviceMainToggle',
                        roomId: state.roomId,
                        id: state.id
                    }).catch((err: { type: "error"; error: HMApi.RequestError<HMApi.RequestToggleDeviceMainToggle>; }) => {
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
                store.dispatch({
                    type: 'SET_CONTEXT_MENU',
                    contextMenu: {
                        x: e.clientX,
                        y: e.clientY,
                        children: [
                            <ContextMenuItem key={0}
                                icon={state.isFavorite ? fasStar : farStar}
                                onClick={() => {
                                    sendRequest({
                                        type: 'devices.toggleDeviceIsFavorite',
                                        roomId: state.roomId,
                                        id: state.id,
                                        isFavorite: !state.isFavorite
                                    }).catch(handleError).finally(async () => {
                                        await refreshFavoriteDeviceStates();
                                    });
                                }}
                            >
                                {state.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            </ContextMenuItem>
                        ]
                    }
                });
            }}
            disabled={intermittent}
        >
            {state.iconText ?
                <div className={`icon-text ${state.iconColor || ''}`}>{state.iconText}</div> :
                <FontAwesomeIcon icon={fas['fa' + (state.icon || state.type.icon)]} className={state.iconColor || ''} />}

            <div className="name">
                {isInFavorites ?
                    <>{roomName} <FontAwesomeIcon icon={faChevronRight} /> {state.name}</> :
                    state.name}
            </div>
            <div className="state">
                {state.statusText}
            </div>
        </button>
    );
}
