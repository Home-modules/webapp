import './rooms.scss';
import { faBath, faBed, faCouch, faDoorClosed, faSpinner, faTimesCircle, faUtensils, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { HMApi } from '../../../comms/api';
import { handleError, sendRequest } from '../../../comms/request';

export default function SettingsPageRooms() { 
    const [rooms, setRooms] = React.useState<HMApi.Room[]|false|null>(null); // null means loading, false means error

    React.useEffect(() => {
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
    }, []);

    return (
        <main id="settings-rooms">
            <h1>Rooms</h1>
            <div className='list'>
                {rooms === null ? (
                    <div className="loading">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Loading...
                    </div>
                ) : rooms === false ? (
                    <div className="error">
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Error loading rooms
                    </div>
                ) : rooms.map(room => (
                    <RoomItem key={room.id} room={room} />
                ))}
            </div>
        </main>
    )
}

function RoomItem({room}: {room: HMApi.Room}) {
    const icons: Record<HMApi.Room['icon'], IconDefinition>= {
        'bathroom': faBath,
        'bedroom': faBed,
        'kitchen': faUtensils,
        'living-room': faCouch,
        'other': faDoorClosed
    }
    return (
        <div className='item'>
            <span className='name'>
                <FontAwesomeIcon icon={icons[room.icon]} />
                {room.name}
            </span>
            <span className='id'>{room.id}</span>
        </div>
    );
}