import './rooms.scss';
import { faBath, faBed, faCouch, faDoorClosed, faPlus, faUtensils, IconDefinition, faPlug, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ReactSortable, Store } from "react-sortablejs";
import Sortable from 'sortablejs';
import { HMApi } from '../../../hub/api';
import { handleError, sendRequest } from '../../../hub/request';
import { store, StoreState } from '../../../store';
import { connect } from 'react-redux';
import { Link, Navigate, Outlet, useMatch, useParams, useSearchParams } from 'react-router-dom';
import SearchKeywordHighlight from '../../../ui/search-highlight';
import { addConfirmationFlyout } from '../../../ui/flyout';
import { PlaceHolders } from '../../../ui/placeholders';
import { PageWithHeader } from '../../../ui/header';

function SettingsPageRooms({rooms, devicesScreen = false}: Pick<StoreState, 'rooms'> & {devicesScreen?: boolean}) {
    let hideList = !!(useMatch('/settings/rooms/:roomId/edit'));
    hideList = !!(useMatch('/settings/rooms/new')) || hideList;
    let collapseList = !!(useMatch('/settings/devices/:roomId'));
    collapseList = !!(useMatch('/settings/devices/:roomId/new/*')) || collapseList;
    collapseList = !!(useMatch('/settings/devices/:roomId/edit/:deviceId')) || collapseList;
    const {roomId= ''} = useParams();

    const [searchParams, setSearchParams] = useSearchParams();
    const search= collapseList ? null : searchParams.get('search');
    const searchFieldRef = React.useRef<HTMLInputElement>(null);

    const [selectedRooms, setSelectedRooms] = React.useState<string[]>([])

    function setRooms(rooms: StoreState['rooms']) {
        store.dispatch({
            type: 'SET_ROOMS',
            rooms
        });
    }

    function updateRooms() {
        if(hideList) return;
        if(rooms === false) {
            setRooms(null);
        }
        sendRequest({
            type: 'rooms.getRooms'
        }).then(res => {
            if(res.type==='ok') {
                setRooms(Object.values(res.data.rooms));
            }
            else {
                setRooms(false);
                handleError(res);
            }
        }).catch(err=> {
            setRooms(false);
            handleError(err);
        });
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(updateRooms, [hideList]); // The `rooms` dependency should not be there because it will cause a state stack overflow

    if (rooms && searchParams.has('redirect')) {
        return <Navigate to={searchParams.get('redirect')!} replace />;
    }
    
    function onSort(evt: Sortable.SortableEvent, sortable: Sortable | null, store: Store) {
        if(rooms) {
            sendRequest({
                type: 'rooms.changeRoomOrder',
                ids: rooms.map(room=>room.id)
            }).catch(handleError)
        }
    }

    return (
        <main id="settings-rooms">
            <PageWithHeader
                title={devicesScreen ? "Edit Devices" : "Edit Rooms"}
                search={{
                    value: search,
                    onChange(search) { setSearchParams(search === null ? {} : { search }) }
                }}
                select={{
                    totalCount: rooms ? rooms.length : Infinity,
                    selectedCount: selectedRooms.length,
                    onToggle(checked) {
                        if(rooms && checked) {
                            setSelectedRooms(rooms.map(r=>r.id));
                        } else {
                            setSelectedRooms([]);
                        }
                    },
                    buttons: [{
                        icon: faTrash,
                        label: "Delete selected",
                        attention: true,
                        onClick(e) {
                            addConfirmationFlyout({
                                element: e.target,
                                text: `Are you sure you want to delete ${selectedRooms.length} ${selectedRooms.length===1 ? 'room':'rooms'}?`,
                                confirmText: "Delete",
                                attention: true,
                                async: true,
                                onConfirm: ()=> (async()=> {
                                    const rooms = [...selectedRooms]; // Clone array it case it changes during the process
                                    for(const roomId of rooms) {
                                        await sendRequest({
                                            type: "rooms.removeRoom",
                                            id: roomId
                                        })
                                    }
                                    store.dispatch({
                                        type: "ADD_NOTIFICATION",
                                        notification: {
                                            type: "success",
                                            message: `Deleted ${rooms.length} ${rooms.length===1?'room':'rooms'}`
                                        }
                                    });
                                    updateRooms();
                                    setSelectedRooms([]);
                                })().catch(handleError)
                            });
                        }
                    }]
                }}
                
                className={`rooms-list ${hideList? 'hidden':''} ${collapseList? 'collapsed':''}`}
                tabIndex={-1}
                onKeyDown={e => {
                    if (e.ctrlKey && e.key === 'f' && !(hideList || collapseList)) {
                        e.preventDefault();
                        setSearchParams({search: ''});
                        searchFieldRef.current?.focus();
                    }
                }}
            >
                <PlaceHolders
                    content={rooms}
                    errorPlaceholder="Error loading rooms"
                    Wrapper={rooms => (search ? (<>
                        {rooms
                            .filter(room => (room.name.toLowerCase().includes(search.toLowerCase()) || room.id.toLowerCase().includes(search.toLowerCase())))
                            .map(room => (
                                <RoomItem
                                    key={room.id}
                                    room={room}
                                    disableReorder
                                    search={search}
                                    active={collapseList ? roomId === room.id : false}
                                    action={selectedRooms.length === 0 ? (collapseList ? 'devices' : (devicesScreen ? 'devices' : 'edit')) : 'check'}
                                    selected={selectedRooms.includes(room.id)}
                                    onSelectChange={() => {
                                        if (selectedRooms.includes(room.id)) {
                                            setSelectedRooms(val => val.filter(el => el !== room.id));
                                        } else {
                                            setSelectedRooms(val => [...val, room.id])
                                        }
                                    }}
                                />
                            ))}
                    </>) : (<>
                        <ReactSortable
                            list={rooms} setList={setRooms} onSort={onSort}
                            animation={200} easing='ease'
                            handle='.drag-handle' ghostClass='ghost'>
                            {rooms.map(room => (
                                <RoomItem
                                    key={room.id}
                                    room={room}
                                    disableReorder={devicesScreen}
                                    active={collapseList ? roomId === room.id : false}
                                    action={selectedRooms.length === 0 ? (collapseList ? 'devices-collapsed' : (devicesScreen ? 'devices' : 'edit')) : 'check'}
                                    selected={selectedRooms.includes(room.id)}
                                    onSelectChange={() => {
                                        if (selectedRooms.includes(room.id)) {
                                            setSelectedRooms(val => val.filter(el => el !== room.id));
                                        } else {
                                            setSelectedRooms(val => [...val, room.id])
                                        }
                                    }}
                                />
                            ))}
                        </ReactSortable>
                        {devicesScreen || (
                            <Link to="/settings/rooms/new" className="add">
                                <FontAwesomeIcon icon={faPlus} />
                            </Link>
                        )}
                    </>))}
                />
            </PageWithHeader>
            <Outlet />
        </main>
    )
}

export default connect(({rooms}: StoreState)=>({rooms}))(SettingsPageRooms);


export const roomIcons: Record<HMApi.T.Room['icon'], IconDefinition>= {
    'bathroom': faBath,
    'bedroom': faBed,
    'kitchen': faUtensils,
    'living-room': faCouch,
    'other': faDoorClosed
}

type RoomItemProps= {
    room: HMApi.T.Room;
    disableReorder?: boolean;
    search?: string;
    active?: boolean;
    action: "edit"|"devices-collapsed"|"devices"|"check",
    selected: boolean,
    onSelectChange: ()=>void
}

function RoomItem({room, disableReorder=false, search, active, action, selected, onSelectChange}: RoomItemProps) {
    return (
        <div className={`item ${active?'active':''}`}>
            {(!disableReorder) && (
                <svg className='drag-handle' width="16" height="16">
                    <path fillRule="evenodd" d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z"></path>
                </svg>
            )}
            <Link 
                to={{
                    "edit": `/settings/rooms/${room.id}/${action}`,
                    "devices": `/settings/devices/${room.id}`,
                    "devices-collapsed": `/settings/devices/${room.id}`,
                    "check": "#",
                }[action]} 
                className={`open ${action==='check'? 'checkbox-visible': ''} ${['devices','devices-collapsed'].includes(action) ? 'checkbox-hidden': ''}`}
                title={action==='devices-collapsed'? room.name : undefined}
                onClick={e=> {
                    if(action==='check') {
                        e.preventDefault();
                        onSelectChange();
                    }
                }}
                onContextMenu={e=> {
                    if(navigator.maxTouchPoints && action==='edit') { // Only on mobile devices and when devices list is closed and select mode is off
                        e.preventDefault();
                        onSelectChange();
                    }
                }}
            >
                <span className='name'>
                    <FontAwesomeIcon icon={roomIcons[room.icon]} fixedWidth />
                    <label className="checkbox">
                        <input 
                            type="checkbox" 
                            checked={selected} 
                            onClick={e=> {e.stopPropagation()}} 
                            onChange={onSelectChange}
                        />
                    </label>
                    <span><SearchKeywordHighlight term={search}>{room.name}</SearchKeywordHighlight></span>
                </span>
                <span className='id subtext'>
                    <SearchKeywordHighlight term={search}>{room.id}</SearchKeywordHighlight>
                </span>
            </Link>
            {action === "devices" || (
                <Link to={`/settings/devices/${room.id}`} className="devices">
                    <div>
                        <FontAwesomeIcon icon={faPlug} />
                    </div>
                </Link>
            )}
        </div>
    );
}