import { faDesktop, faPen, faRotate, faRotateRight, faStar, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useSearchParams } from "react-router-dom";
import { store, StoreState } from "../../store";
import ScrollView from "../../ui/scrollbar";
import { roomIcons } from "../settings/rooms/rooms";
import { ContextMenuItem } from "../../ui/context-menu";
import './choose-room.scss';
import { handleError, sendRequest } from "../../hub/request";
import { refreshRoomStates } from "./home";
import { PlaceHolders } from "../../ui/placeholders";
import { getAppearanceSetting } from "../settings/appearance/appearance";


export default function HomePageChooseRoom({ roomStates, appearanceSettings, allowDesktopMode }: Pick<StoreState, 'roomStates'|'appearanceSettings'|'allowDesktopMode'>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const isDesktopMode = searchParams.get('desktop') !== null;

    function navigated(e: React.MouseEvent<HTMLAnchorElement>) {
        e.currentTarget.scrollIntoView({
            inline: 'center',
            block: 'center',
            behavior: 'smooth'
        });
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLAnchorElement>) {
        const element =
            e.key === 'ArrowLeft' ?
                (e.target as HTMLElement).previousElementSibling :
            e.key === 'ArrowRight' ?
                (e.target as HTMLElement).nextElementSibling :
            null;
        
        if (element?.tagName === 'A') {
            e.preventDefault();
            (element as HTMLElement).focus();
            (element as HTMLElement).click();
        }
    }

    return (
        <PlaceHolders
            className="choose-room"
            content={roomStates}
            Wrapper={(states => (
                <div className="choose-room">
                <ScrollView
                    tagName="nav"
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
                                        onClick={refreshRoomStates}
                                    >
                                        Refresh
                                    </ContextMenuItem>,
                                    <ContextMenuItem key={1}
                                        icon={faPen}
                                        href="/settings/rooms"
                                    >
                                        Edit rooms
                                    </ContextMenuItem>
                                ]
                            }
                        })
                    }}
                >
                    <NavLink
                        to={isDesktopMode ? "/home?desktop" : "/home"}
                        caseSensitive
                        className={({ isActive }) => `${isActive ? 'active' : ''} favorites`}
                        end
                        onClick={navigated}
                        onKeyDown={onKeyDown}
                    >
                        <FontAwesomeIcon icon={faStar} />
                        <span>
                            Favorites
                        </span>
                    </NavLink>
                    {states.map(roomState => (
                        <NavLink
                            key={roomState.id}
                            to={`/home/${roomState.id}${isDesktopMode?'?desktop':''}`}
                            caseSensitive
                            className={({ isActive }) => `${isActive ? 'active' : ''} ${roomState.disabled ? 'disabled' : ''}`}
                            onClick={navigated}
                            onKeyDown={onKeyDown}
                            onContextMenu={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                store.dispatch({
                                    type: 'SET_CONTEXT_MENU',
                                    contextMenu: {
                                        x: e.clientX,
                                        y: e.clientY,
                                        children: [
                                            (roomState.disabled ? (
                                                <ContextMenuItem key={0}
                                                    icon={faRotateRight}
                                                    onClick={async () => {
                                                        await sendRequest({
                                                            type: 'rooms.restartRoom',
                                                            id: roomState.id
                                                        }).catch(handleError);
                                                        await refreshRoomStates();
                                                    }}
                                                >
                                                    Restart room
                                                </ContextMenuItem>
                                            ) : null),
                                            <ContextMenuItem key={1}
                                                icon={faPen}
                                                href={`/settings/rooms/${roomState.id}/edit`}
                                            >
                                                Edit
                                            </ContextMenuItem>
                                        ]
                                    }
                                })
                            }}
                        >
                            <FontAwesomeIcon icon={roomIcons[roomState.icon]} />
                            <span>
                                {roomState.name}
                            </span>
                        </NavLink>
                    ))}
                </ScrollView>
                    {(allowDesktopMode && getAppearanceSetting('showDesktopModeButton', appearanceSettings)) && (
                        <button
                            className="icon"
                            onClick={() => {
                                setSearchParams(isDesktopMode ? {} : 'desktop');
                            }}
                            title={isDesktopMode ? 'Quit desktop mode' : 'Enter desktop mode'}
                        >
                            <FontAwesomeIcon icon={isDesktopMode ? faTimes : faDesktop} />
                        </button>
                    )}
            </div>))}
            loadingPlaceholder="Loading rooms..."
            errorPlaceholder="There was an error loading the rooms"
        />
    );
}