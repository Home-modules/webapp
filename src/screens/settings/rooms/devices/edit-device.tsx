import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import './edit-device.scss';
import { StoreState } from '../../../../store';
import { connect } from 'react-redux';
import { HMApi } from '../../../../hub/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import Fields, { getFieldsErrors, getSettingsFieldDefaultValue } from '../../../../ui/fields/fields';
import getFlatFields from '../../../../utils/flat-fields';
import { handleError, sendRequest } from '../../../../hub/request';
import Button, { IntermittentButton } from '../../../../ui/button';
import machineFriendlyName from '../../../../utils/machine-friendly-name';
import ScrollView from '../../../../ui/scrollbar';
import { addConfirmationFlyout } from '../../../../ui/flyout';

/** Resolves all needed objects from their IDs (and redirects to the proper location if something wasn't found) */
function SettingsPageRoomsDevicesEditDevice_({ deviceTypes, rooms, devices } : Pick<StoreState, 'deviceTypes'|'rooms'|'devices'>) {
    let { deviceType: deviceTypeId, roomId, deviceId } = useParams();
    const location = useLocation();

    const room = rooms ? rooms.find(r=> r.id === roomId) : undefined;
    if(!rooms) { // Rooms are not loaded yet
        return <Navigate to={`/settings/rooms?redirect=${location.pathname}`} />
    }
    if((!roomId) || (!room)) { // Room not found
        return <Navigate to="/settings/rooms" />
    }

    if(deviceId) { // Editing existing device

        const devicesInRoom = devices[roomId];
        if(!devicesInRoom) { // Devices not loaded yet
            return <Navigate to={`/settings/rooms/${roomId}/devices?redirect=${location.pathname}`} />
        }

        const device = devicesInRoom.find(d=> d.id === deviceId);
        if (!device) { // Device not found
            return <Navigate to={`/settings/rooms/${roomId}/devices`} />
        }

        const deviceTypesForController = deviceTypes[room.controllerType.type];
        if(!deviceTypesForController) { // Device types not loaded yet
            return <Navigate to={`/settings/rooms/${roomId}/devices?redirect=${location.pathname}`} />
        }

        const deviceType = deviceTypesForController ? deviceTypesForController.find(t=> t.id === device.type) : undefined;
        if(!deviceType) { // Device type not found
            return <Navigate to={`/settings/rooms/${roomId}/devices`} />
        }

        return <EditDevice deviceType={deviceType} room={room} device={device} />
    } 
    else if(deviceTypeId) { // New device

        const deviceTypesForController = deviceTypes[room.controllerType.type];
        if(!deviceTypesForController) { // Device types not loaded yet
            return <Navigate to={`/settings/rooms/${roomId}/devices?redirect=${location.pathname}`} />
        }

        const deviceType = deviceTypesForController ? deviceTypesForController.find(t=> t.id === deviceTypeId) : undefined;
        if(!deviceType) { // Device type not found
            return <Navigate to={`/settings/rooms/${roomId}/devices`} />
        }

        return <EditDevice deviceType={deviceType} room={room} />
    }
    else {
        return <Navigate to={`/settings/rooms/${roomId}/devices`} />
    }
}

const SettingsPageRoomsDevicesEditDevice = connect(({ deviceTypes, rooms, devices }: StoreState) => ({ deviceTypes, rooms, devices }))(SettingsPageRoomsDevicesEditDevice_);
export default SettingsPageRoomsDevicesEditDevice;

type EditDeviceProps = {
    deviceType: HMApi.T.DeviceType;
    room: HMApi.T.Room;
    device?: HMApi.T.Device;
}

function EditDevice({ deviceType, room,  device }: EditDeviceProps) {
    const isNew = !device;

    device ||= {
        id: '',
        name: '',
        type: deviceType.id,
        params: {}
    };
    const navigate = useNavigate();

    const [name, setName] = React.useState(device.name);
    const [nameError, setNameError] = React.useState('');
    const nameRef = React.useRef<HTMLInputElement>(null);

    const [id, setId] = React.useState(device.id);
    const [idError, setIdError] = React.useState('');
    const idRef = React.useRef<HTMLInputElement>(null);

    const [fieldValues, setFieldValues] = React.useState(
        isNew? Object.fromEntries(getFlatFields(deviceType.settings)
                 .map(f=> [f.id, getSettingsFieldDefaultValue(f)]))
               : device.params
    );
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string|undefined>>({});

    function onSave() {
        device = device as HMApi.T.Device;
        const [hasError, errors] = getFieldsErrors(getFlatFields(deviceType.settings), fieldValues);
        setFieldErrors({ });
        if(hasError) {
            window.setTimeout(()=> { // Combined with the code two lines above here, this causes the existing errors to be removed and set again, causing the shake animations to repeat.
                setFieldErrors(errors);
            });
            return Promise.reject();
        }
        
        const nDevice: HMApi.T.Device = {
            id,
            name,
            type: deviceType.id,
            params: fieldValues
        };

        return sendRequest({
            type: isNew ? 'devices.addDevice' : 'devices.editDevice',
            roomId: room.id,
            device: nDevice
        }).then(res=> {
            if(res.type==='ok') {
                navigate(`/settings/rooms/${room.id}/devices`);
            }
            else {
                throw res;
            }
        }).catch((err: HMApi.ResponseOrError<HMApi.Request.EditDevice|HMApi.Request.AddDevice>)=> {
            if(err.type==='error') {
                if(err.error.message==='PARAMETER_OUT_OF_RANGE' && err.error.paramName==='device.name') {
                    setNameError(name.length ? 'Name is too long' : 'Name is empty');
                    nameRef.current?.focus();
                    return;
                }
                else if(err.error.message==='PARAMETER_OUT_OF_RANGE' && err.error.paramName==='device.id') {
                    setIdError(id.length ? 'ID is too long' : 'ID is empty');
                    idRef.current?.focus();
                    return;
                }
                else if(err.error.message==='DEVICE_ALREADY_EXISTS') {
                    setIdError('Device with this ID already exists');
                    idRef.current?.focus();
                    return;
                }
            }
            handleError(err);
        });

    }

    return (
        <ScrollView className={`edit-device`}>
            <h1>
                <Link to="..">
                    <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                </Link>
                <span className="title">
                    {isNew ? <>New {deviceType.name}</> : <>Editing {device.name} ({deviceType.name})</>}
                </span>
                {isNew || (
                    <Button 
                        onClick={(e)=> {
                            addConfirmationFlyout({
                                element: e.target,
                                text: "Are you sure you want to delete this device?",
                                width: 190,
                                confirmText: "Delete",
                                attention: true,
                                async: true,
                                onConfirm: ()=> sendRequest({
                                    'type': 'devices.removeDevice',
                                    roomId: room.id,
                                    id
                                }).then(res=>{
                                    if(res.type==='ok') {
                                        navigate(`/settings/rooms/${room.id}/devices`);
                                    }
                                    else handleError(res);
                                }, handleError)
                            })
                        }}
                        title="Delete device"
                        attention
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                )}
            </h1>

            <div className="name-and-id">
                <label className='text' data-error={nameError}>
                    Name
                    <input type="text" value={name} ref={nameRef} onChange={e=>{
                        setName(e.target.value);
                        setNameError('');
                    }} onBlur={e=> {
                        if(!id) {
                            // If the ID is empty, set it to a machine-friendly version of the name
                            setId(machineFriendlyName(e.target.value));
                        }
                    }} autoFocus={isNew} />
                </label>
                <label className='text' data-error={idError} data-disabled={!isNew} title={(!isNew) ? 'Device ID cannot be changed after it is created': undefined}>
                    ID (permanent)
                    <input type="text" disabled={!isNew} value={id} ref={idRef} onChange={e=>{
                        if(isNew) {
                            setId(e.target.value);
                            setIdError('');
                        }
                    }} />
                </label>
            </div>

            <Fields 
                fields={deviceType.settings} 
                fieldErrors={fieldErrors} 
                fieldValues={fieldValues} 
                setFieldValues={setFieldValues} 
                setFieldErrors={setFieldErrors}
                context={{
                    for: "device",
                    controller: room.controllerType.type,
                    deviceType: deviceType.id
                }} 
            />

            <IntermittentButton
                primary className='save' onClick={onSave}>
                <FontAwesomeIcon icon={faSave} /> Save
            </IntermittentButton>
        </ScrollView>
    );
}