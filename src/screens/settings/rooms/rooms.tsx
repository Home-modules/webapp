import './rooms.scss';
import { faBath, faBed, faCouch, faDoorClosed, faPlus, faSearch, faTimesCircle, faTimes, faUtensils, IconDefinition, faPlug } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ReactSortable, Store } from "react-sortablejs";
import Sortable from 'sortablejs';
import { HMApi } from '../../../comms/api';
import { handleError, sendRequest } from '../../../comms/request';
import { store, StoreState } from '../../../store';
import { connect } from 'react-redux';
import { Link, Outlet, useMatch, useSearchParams } from 'react-router-dom';
import SearchKeywordHighlight from '../../../ui/search-highlight';

function SettingsPageRooms({rooms}: Pick<StoreState, 'rooms'>) {
    let hideList = !!(useMatch('/settings/rooms/:roomId/edit'));
    hideList = !!(useMatch('/settings/rooms/new')) || hideList;
    hideList = !!(useMatch('/settings/rooms/:roomId/devices')) || hideList;
    hideList = !!(useMatch('/settings/rooms/:roomId/devices/new/*')) || hideList;

    const [searchParams, setSearchParams] = useSearchParams();
    const search= searchParams.get('search');
    const searchFieldRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

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
    React.useEffect(updateRooms, [hideList]);

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
            <div className={`rooms-list ${hideList? 'hidden':''}`}>
                <h1 className={`searchable ${search===null ? '' : 'search-active'}`}>
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
                                <RoomItem key={room.id} room={room} disableReorder search={search} />
                            ))
                    ) : (<>
                        <ReactSortable 
                            list={rooms} setList={setRooms} onSort={onSort}
                            animation={200} easing='ease' 
                            handle='.drag-handle' ghostClass='ghost'>
                            {rooms.map(room => (
                                <RoomItem key={room.id} room={room} />
                            ))}
                        </ReactSortable>
                        <Link to="/settings/rooms/new" className="add">
                            <FontAwesomeIcon icon={faPlus} />
                        </Link>
                    </>)}
                </div>
            </div>
            <Outlet />
        </main>
    )
}

export default connect(({rooms}: StoreState)=>({rooms}))(SettingsPageRooms);

type RoomItemProps= {
    room: HMApi.Room;
    disableReorder?: boolean;
    search?: string;
}

function RoomItem({room, disableReorder=false, search}: RoomItemProps) {
    const icons: Record<HMApi.Room['icon'], IconDefinition>= {
        'bathroom': faBath,
        'bedroom': faBed,
        'kitchen': faUtensils,
        'living-room': faCouch,
        'other': faDoorClosed
    }
    return (
        <div className='item'>
            {(!disableReorder) && (
                <svg className='drag-handle' width="16" height="16">
                    <path fillRule="evenodd" d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z"></path>
                </svg>
            )}
            <Link to={`/settings/rooms/${room.id}/edit`} className='open'>
                <span className='name'>
                    <FontAwesomeIcon icon={icons[room.icon]} fixedWidth />
                    <SearchKeywordHighlight term={search}>{room.name}</SearchKeywordHighlight>
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