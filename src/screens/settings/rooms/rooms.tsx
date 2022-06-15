import './rooms.scss';
import { faBath, faBed, faCouch, faDoorClosed, faPlus, faSearch, faTimesCircle, faTimes, faUtensils, IconDefinition, faPlug, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ReactSortable, Store } from "react-sortablejs";
import Sortable from 'sortablejs';
import { HMApi } from '../../../hub/api';
import { handleError, sendRequest } from '../../../hub/request';
import { store, StoreState } from '../../../store';
import { connect } from 'react-redux';
import { Link, Outlet, useMatch, useParams, useSearchParams } from 'react-router-dom';
import SearchKeywordHighlight from '../../../ui/search-highlight';
import ScrollView from '../../../ui/scrollbar';
import { addConfirmationFlyout } from '../../../ui/flyout';

function SettingsPageRooms({rooms}: Pick<StoreState, 'rooms'>) {
    let hideList = !!(useMatch('/settings/rooms/:roomId/edit'));
    hideList = !!(useMatch('/settings/rooms/new')) || hideList;
    let collapseList = !!(useMatch('/settings/rooms/:roomId/devices'));
    collapseList = !!(useMatch('/settings/rooms/:roomId/devices/new/*')) || collapseList;
    collapseList = !!(useMatch('/settings/rooms/:roomId/devices/edit/:deviceId')) || collapseList;
    const {roomId= ''} = useParams();

    const [searchParams, setSearchParams] = useSearchParams();
    const search= searchParams.get('search');
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
            <ScrollView className={`rooms-list ${hideList? 'hidden':''} ${collapseList? 'collapsed':''}`}>
                <h1 className={`searchable ${search===null ? '' : 'search-active'} ${selectedRooms.length===0 ? '' : 'selected-active'}`}>
                    <div className="title">
                        <span>Edit Rooms</span>
                        <FontAwesomeIcon icon={faSearch} onClick={()=>{
                            setSearchParams({search: ''});
                            searchFieldRef.current?.focus();
                        }} />
                    </div>
                    <div className="search">
                        <FontAwesomeIcon icon={faSearch} />
                        <input type="text" placeholder="Search" value={search||''} onChange={(e)=>setSearchParams({search: e.target.value})} ref={searchFieldRef} />
                        <FontAwesomeIcon icon={faTimes} onClick={()=>setSearchParams({})} />
                    </div>
                    <div className="selected">
                        <label className="checkbox">
                            <input 
                                type="checkbox" 
                                checked={rooms ? selectedRooms.length === rooms.length: false}
                                onChange={e=> {
                                    if(rooms && e.target.checked) {
                                        setSelectedRooms(rooms.map(r=>r.id));
                                    } else {
                                        setSelectedRooms([]);
                                    }
                                }} 
                                title="Select all"
                            />
                        </label>
                        <span>{selectedRooms.length}</span>
                        <FontAwesomeIcon icon={faTrash} onClick={e=> {
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
                        }}/>
                        <FontAwesomeIcon icon={faTimes} onClick={()=>setSelectedRooms([])} />
                    </div>
                </h1>
                <div className='list'>
                    {rooms === null ? (
                        <div className="loading">
                            <span className="circle" />
                            Loading...
                        </div>
                    ) : rooms === false ? (
                        <div className="error">
                            <FontAwesomeIcon icon={faTimesCircle} />
                            Error loading rooms
                        </div>
                    ) : search ? (
                        rooms
                            .filter(room=>(room.name.toLowerCase().includes(search.toLowerCase()) || room.id.toLowerCase().includes(search.toLowerCase())))
                            .map(room => (
                                <RoomItem 
                                    key={room.id} 
                                    room={room} 
                                    disableReorder 
                                    search={search} 
                                    active={collapseList ? roomId===room.id : false} 
                                    action={selectedRooms.length===0 ? (collapseList ? 'devices':'edit') : 'check'}
                                    selected={selectedRooms.includes(room.id)}
                                    onSelectChange={()=> {
                                        if(selectedRooms.includes(room.id)) {
                                            setSelectedRooms(val=> val.filter(el=> el!==room.id));
                                        } else {
                                            setSelectedRooms(val=> [...val, room.id])
                                        }
                                    }}
                                />
                            ))
                    ) : (<>
                        <ReactSortable 
                            list={rooms} setList={setRooms} onSort={onSort}
                            animation={200} easing='ease' 
                            handle='.drag-handle' ghostClass='ghost'>
                            {rooms.map(room => (
                                <RoomItem 
                                    key={room.id} 
                                    room={room} 
                                    active={collapseList ? roomId===room.id : false} 
                                    action={selectedRooms.length===0 ? (collapseList ? 'devices':'edit') : 'check'}
                                    selected={selectedRooms.includes(room.id)}
                                    onSelectChange={()=> {
                                        if(selectedRooms.includes(room.id)) {
                                            setSelectedRooms(val=> val.filter(el=> el!==room.id));
                                        } else {
                                            setSelectedRooms(val=> [...val, room.id])
                                        }
                                    }}
                                />
                            ))}
                        </ReactSortable>
                        <Link to="/settings/rooms/new" className="add">
                            <FontAwesomeIcon icon={faPlus} />
                        </Link>
                    </>)}
                </div>
            </ScrollView>
            <Outlet />
        </main>
    )
}

export default connect(({rooms}: StoreState)=>({rooms}))(SettingsPageRooms);

type RoomItemProps= {
    room: HMApi.Room;
    disableReorder?: boolean;
    search?: string;
    active?: boolean;
    action: "edit"|"devices"|"check",
    selected: boolean,
    onSelectChange: ()=>void
}

function RoomItem({room, disableReorder=false, search, active, action, selected, onSelectChange}: RoomItemProps) {
    const icons: Record<HMApi.Room['icon'], IconDefinition>= {
        'bathroom': faBath,
        'bedroom': faBed,
        'kitchen': faUtensils,
        'living-room': faCouch,
        'other': faDoorClosed
    }
    return (
        <div className={`item ${active?'active':''}`}>
            {(!disableReorder) && (
                <svg className='drag-handle' width="16" height="16">
                    <path fillRule="evenodd" d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z"></path>
                </svg>
            )}
            <Link 
                to={action==='check' ? '#' : `/settings/rooms/${room.id}/${action}`} 
                className={`open ${action==='check'? 'checkbox-visible': ''}`}
                title={action==='devices'? room.name : undefined}
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
                    <FontAwesomeIcon icon={icons[room.icon]} fixedWidth />
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
                <span className='id'>
                    <SearchKeywordHighlight term={search}>{room.id}</SearchKeywordHighlight>
                </span>
            </Link>
            <Link to={`${room.id}/devices`} className="devices">
                <div>
                    <FontAwesomeIcon icon={faPlug} />
                </div>
            </Link>
        </div>
    );
}