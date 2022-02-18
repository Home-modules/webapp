import './rooms.scss';
import { faBath, faBed, faCouch, faDoorClosed, faPlus, faTimesCircle, faUtensils, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ReactSortable, Store } from "react-sortablejs";
import Sortable from 'sortablejs';
import { HMApi } from '../../../comms/api';
import { handleError, sendRequest } from '../../../comms/request';
import { store, StoreState } from '../../../store';
import { connect } from 'react-redux';
import { Link, Outlet, useMatch } from 'react-router-dom';

function SettingsPageRooms({rooms}: Pick<StoreState, 'rooms'>) {
    let editing = !!(useMatch('/settings/rooms/edit/:roomId'));
    editing = !!(useMatch('/settings/rooms/new')) || editing;

    function setRooms(rooms: StoreState['rooms']) {
        store.dispatch({
            type: 'SET_ROOMS',
            rooms
        });
    }

    function updateRooms() {
        if(editing) return;
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
    React.useEffect(updateRooms, [editing]);

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
            <div className={`rooms-list ${editing? 'hidden':''}`}>
                <h1>Edit Rooms</h1>
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
}

function RoomItem({room}: RoomItemProps) {
    const icons: Record<HMApi.Room['icon'], IconDefinition>= {
        'bathroom': faBath,
        'bedroom': faBed,
        'kitchen': faUtensils,
        'living-room': faCouch,
        'other': faDoorClosed
    }
    return (
        <div className='item'>
            <svg className='drag-handle' width="16" height="16">
                <path fillRule="evenodd" d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z"></path>
            </svg>
            <Link to={`/settings/rooms/edit/${room.id}`} className='open'>
                <span className='name'>
                    <FontAwesomeIcon icon={icons[room.icon]} fixedWidth />
                    {room.name}
                </span>
                <span className='id'>{room.id}</span>
            </Link>
        </div>
    );
}