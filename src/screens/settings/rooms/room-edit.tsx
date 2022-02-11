import './room-edit.scss';
import { HMApi } from "../../../comms/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBath, faBed, faCouch, faDoorClosed, faSave, faTrash, faUtensils } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { IntermittentableButton } from '../../../ui/button';
import { handleError, sendRequest } from '../../../comms/request';
import DropDownSelect from '../../../ui/dropdown';

export type SettingsPageRoomsEditRoomProps = {
    room: HMApi.Room & {new?: boolean};
    onClose: () => void;
    hidden?: boolean;
}

const iconIds: HMApi.Room['icon'][] = [
    'living-room',
    'kitchen',
    'bedroom',
    'bathroom',
    'other'
]

export default function SettingsPageRoomsEditRoom({room, onClose, hidden=false}: SettingsPageRoomsEditRoomProps) {
    const [name, setName] = React.useState(room.name);
    const [nameError, setNameError] = React.useState('');
    const nameRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [id, setId] = React.useState(room.id);
    const [idError, setIdError] = React.useState('');
    const idRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [iconId, setIconId] = React.useState(iconIds.indexOf(room.icon));

    const [controller, setController] = React.useState(room.controllerType);
    const [serialPorts, setSerialPorts] = React.useState<HMApi.SerialPort[]|0|-1>(0); // 0= loading -1= error
    const [serialPortError, setSerialPortError] = React.useState('');

    function onSave() {
        const nRoom: HMApi.Room = {
            id,
            name,
            icon: iconIds[iconId],
            controllerType: controller
        };

        if(room.new) {
            return sendRequest({
                type: 'rooms.addRoom',
                room: nRoom
            });
        }
        else {
            return sendRequest({
                'type': 'rooms.editRoom',
                room: nRoom
            });
        }
    }

    function loadSerialPorts() {
        if(!(serialPorts instanceof Array && serialPorts.length)) { // If the list has been loaded before, do not show 'Loading'. Do so otherwise
            setSerialPorts(0);
        }
        sendRequest({
            type: 'io.getSerialPorts'
        }).then(res => {
            if(res.type==='ok') {
                setSerialPorts(res.data.ports);
            }
            else {
                handleError(res);
                setSerialPorts(-1);
            }
        }).catch(err=> {
            handleError(err);
            setSerialPorts(-1);
        });
    }

    function onSaveSuccess(res: HMApi.Response<HMApi.RequestEditRoom|HMApi.RequestAddRoom>) {
        if(res.type==='ok') {
            onClose();
        }
        else {
            onSaveError(res);
        }
    }

    function onSaveError(err: HMApi.Response<HMApi.RequestEditRoom|HMApi.RequestAddRoom>) {
        if(err.type==='error') {
            if(err.error.message==='PARAMETER_OUT_OF_RANGE' && err.error.paramName==='room.name') {
                setNameError(name.length ? 'Name is too long' : 'Name is empty');
                nameRef.current?.focus();
                return;
            }
            else if(err.error.message==='PARAMETER_OUT_OF_RANGE' && err.error.paramName==='room.controllerType.port') {
                setSerialPortError('Invalid port');
                return;
            }
            else if(err.error.message==='PARAMETER_OUT_OF_RANGE' && err.error.paramName==='room.id') {
                setIdError(id.length ? 'ID is too long' : 'ID is empty');
                idRef.current?.focus();
                return;
            }
            else if(err.error.message==='ROOM_ALREADY_EXISTS') {
                setIdError('Room with this ID already exists');
                idRef.current?.focus();
                return;
            }
        }
        handleError(err);
    }

    return (
        <div className={`edit-room ${hidden?'hidden':''}`}>
            <h1>
                <FontAwesomeIcon icon={faArrowLeft} onClick={onClose} fixedWidth />
                <span className="title">
                    {room.new ? "New room" : <>Editing {room.name}</>}
                </span>
                {room.new || (
                    <IntermittentableButton 
                        onClick={()=> sendRequest({
                            'type': 'rooms.removeRoom',
                            id
                        })}
                        onThen={res=>{
                            if(res.type==='ok') {
                                onClose();
                            }
                            else handleError(res);
                        }}
                        onCatch={handleError}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </IntermittentableButton>
                )}
            </h1>

            <div className="name-and-id">
                <label data-error={nameError}>
                    Name
                    <input type="text" value={name} ref={nameRef} onChange={e=>{
                        setName(e.target.value);
                        setNameError('');
                    }} onBlur={e=> {
                        if(!id) {
                            // If the ID is empty, set it to a machine-friendly version of the name
                            setId(e.target.value
                                .replace(/[^A-Za-z0-9 ]/g,'') // Remove unwanted characters, only accept alphanumeric and space
                                .replace(/\s{2,}/g,' ') // Replace multi spaces with a single space
                                .toLowerCase() // Make it lowercase (this line is not in the original package, I added it)
                                .replace(/\s/g, "-") // Replace space with a '-' symbol)
                            );
                            // These three lines are from https://github.com/mrded/machine-name/blob/master/index.js.
                            // The package wasn't TS-compatible, so I had to copy the code.
                        }
                    }} />
                </label>
                <label data-error={idError} data-disabled={!room.new} title={(!room.new) ? 'Room ID cannot be changed after it is created': undefined}>
                    ID (permanent)
                    <input type="text" disabled={!room.new} value={id} ref={idRef} onChange={e=>{
                        if(room.new) {
                            setId(e.target.value);
                            setIdError('');
                        }
                    }} />
                </label>
            </div>

            <div className="icon-select-title">Icon</div>
            <div className='icon-select' data-icon={iconId}>
                <FontAwesomeIcon icon={faCouch} onClick={()=>setIconId(0)} />
                <FontAwesomeIcon icon={faUtensils} onClick={()=>setIconId(1)} />
                <FontAwesomeIcon icon={faBed} onClick={()=>setIconId(2)} />
                <FontAwesomeIcon icon={faBath} onClick={()=>setIconId(3)} />
                <FontAwesomeIcon icon={faDoorClosed} onClick={()=>setIconId(4)} />
            </div>

            <fieldset>
                <legend>Controller</legend>

                <div className="controller-type-select-title">Controller type &amp; mode</div>
                <DropDownSelect options={[
                    {
                        label: 'Standard',
                        subtext: 'Serial port',
                        value: 'standard-serial'
                    }
                ]} onChange={val=> setController({...controller, type:val})} value={controller.type}/>

                {controller.type==='standard-serial' ? (<>
                    <div className="controller-serial-port-select-title">Serial port</div>
                    <DropDownSelect options={
                        serialPorts instanceof Array ?
                            serialPorts.map(({path})=>({
                                label: path,
                                value: path
                            }))
                            : []
                        } onChange={val=> {
                            setController({...controller, port:val});
                            setSerialPortError('')
                        }} 
                        value={{
                            label: controller.port,
                            value: controller.port
                        }}
                        onOpen={loadSerialPorts}
                        error={serialPortError}
                    >
                        {serialPorts===0 ? (
                            <div className="loading">Loading...</div>
                        ): serialPorts===-1 ? (
                            <div className="error">Error loading serial ports</div>
                        ): (
                            <div className="empty">No serial ports detected</div>
                        )}
                    </DropDownSelect>
                </>): null}
            </fieldset>

            <IntermittentableButton<HMApi.Response<HMApi.RequestAddRoom|HMApi.RequestEditRoom>>
                primary className='save' onClick={onSave} onThen={onSaveSuccess} onCatch={onSaveError}>
                <FontAwesomeIcon icon={faSave} /> Save
            </IntermittentableButton>
        </div>
    );
}
