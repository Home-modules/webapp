import './rooms.scss';
import { faBath, faBed, faCouch, faDoorClosed, faPlus, faTimesCircle, faUtensils, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ReactSortable, Store } from "react-sortablejs";
import Sortable from 'sortablejs';
import { HMApi } from '../../../comms/api';
import { handleError, sendRequest } from '../../../comms/request';
import SettingsPageRoomsEditRoom from './room-edit';

export default function SettingsPageRooms() { 
    const [rooms, setRooms] = React.useState<HMApi.Room[]|false|null>(null); // null means loading, false means error
    const [editingRoom, setEditingRoom] = React.useState<(HMApi.Room & {new?: boolean})|null>(null);
    const [closingEditRoom, setClosingEditRoom] = React.useState(false);

    function updateRooms() {
        setRooms(null);
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
    React.useEffect(updateRooms, []);

    function closeRoom() {
        updateRooms();
        setClosingEditRoom(true);
        setTimeout(()=> {
            setEditingRoom(null);
            setClosingEditRoom(false);
        }, 1000);
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
            <div className={`rooms-list ${(editingRoom && !closingEditRoom)? 'hidden':''}`}>
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
                                <RoomItem key={room.id} room={room} onClick={()=> setEditingRoom(room)} />
                            ))}
                        </ReactSortable>
                        <div className="add" onClick={()=> setEditingRoom({
                            id: '',
                            controllerType: {
                                port: '',
                                type: 'standard-serial'
                            },
                            icon: 'other',
                            name: '',
                            new: true
                        })}>
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                    </>)}
                </div>
            </div>
            {editingRoom && (
                <SettingsPageRoomsEditRoom room={editingRoom} onClose={closeRoom} hidden={closingEditRoom} />
            )}
        </main>
    )
}

type RoomItemProps= {
    room: HMApi.Room;
    onClick: () => void;
}

function RoomItem({room, onClick}: RoomItemProps) {
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
            <div className='open' onClick={onClick}>
                <span className='name'>
                    <FontAwesomeIcon icon={icons[room.icon]} fixedWidth />
                    {room.name}
                </span>
                <span className='id'>{room.id}</span>
            </div>
        </div>
    );
}