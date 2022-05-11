import './room-edit.scss';
import { HMApi } from "../../../comms/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBath, faBed, faCouch, faDoorClosed, faSave, faTrash, faUtensils } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { IntermittentableButton } from '../../../ui/button';
import { handleError, sendRequest } from '../../../comms/request';
import { LazyDropDownSelect } from "../../../ui/dropdown/lazy";
import { StoreState } from '../../../store';
import { Link, Navigate, useMatch, useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import machineFriendlyName from '../../../utils/machine-friendly-name';
import Fields, { getFieldsErrors, getSettingsFieldDefaultValue } from '../../../ui/fields/fields';
import getFlatFields from '../../../utils/flat-fields';

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

function SettingsPageRoomsEditRoom({rooms}: Pick<StoreState, 'rooms'>) {
    const isNew = !!useMatch('/settings/rooms/new');
    const {roomId= ''} = useParams();
    let room= (rooms && rooms.find(room=>room.id===roomId))
    const roomExists= !!room;
    room ||= {
        id: '',
        name: '',
        icon: 'other',
        controllerType: {
            type: 'arduino:serial',
            settings: {

            }
        }
    };
    const navigate = useNavigate();

    const [name, setName] = React.useState(room.name);
    const [nameError, setNameError] = React.useState('');
    const nameRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [id, setId] = React.useState(room.id);
    const [idError, setIdError] = React.useState('');
    const idRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const [iconId, setIconId] = React.useState(iconIds.indexOf(room.icon));

    const [controller, setController] = React.useState(room.controllerType);
    const [controllerTypes, setControllerTypes] = React.useState<HMApi.RoomControllerType[]|0|-1>(0); // 0= loading -1= error

    const [fields, setFields] = React.useState<HMApi.SettingsField[]>([]);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string|undefined>>({});

    function onSave() {
        const [hasError, errors] = getFieldsErrors(getFlatFields(fields), controller.settings);
        setFieldErrors({ });
        if(hasError) {
            window.setTimeout(()=> { // Combined with the code two lines above here, this causes the existing errors to be removed and set again, causing the shake animations to repeat.
                setFieldErrors(errors);
            });
            return;
        }
        
        const nRoom: HMApi.Room = {
            id,
            name,
            icon: iconIds[iconId],
            controllerType: controller
        };

        if(isNew) {
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

    function onSaveSuccess(res: HMApi.Response<HMApi.RequestEditRoom|HMApi.RequestAddRoom>) {
        if(res.type==='ok') {
            navigate('/settings/rooms');
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

    function onChangeControllerType(val?: string) { // val is not set when called by useEffect, and the existing settings must be kept in that case.
        console.log('onChangeControllerType', val, room? room.controllerType.settings:undefined);
        if(!(controllerTypes instanceof Array)) return;
        const defaultRCType = room ? room.controllerType.type : 'arduino:serial';
        const controller: HMApi.RoomController = {
            type: val || defaultRCType,
            settings: ((!val) && room) ? room.controllerType.settings : { }
        }
        const controllerType = controllerTypes.find(type => type.id === (val || defaultRCType));
        if(!controllerType) return;

        if(val || isNew) {
            for(const field of getFlatFields(controllerType.settings)) {
                controller.settings[field.id] = getSettingsFieldDefaultValue(field);
            }
        }

        setController(controller);
        setFields(controllerType.settings);
        setFieldErrors({});
    }

    React.useEffect(onChangeControllerType, [controllerTypes])

    if(!(roomExists || isNew)) {
        return <Navigate to="/settings/rooms" />
    }

    return (
        <div className={`edit-room`}>
            <h1>
                <Link to="/settings/rooms">
                    <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
                </Link>
                <span className="title">
                    {isNew ? "New room" : <>Editing {room.name}</>}
                </span>
                {isNew || (
                    <IntermittentableButton 
                        onClick={()=> sendRequest({
                            'type': 'rooms.removeRoom',
                            id
                        })}
                        onThen={res=>{
                            if(res.type==='ok') {
                                navigate('/settings/rooms')
                            }
                            else handleError(res);
                        }}
                        onCatch={handleError}
                        title="Delete room"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </IntermittentableButton>
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
                    }} />
                </label>
                <label className='text' data-error={idError} data-disabled={!isNew} title={(!isNew) ? 'Room ID cannot be changed after it is created': undefined}>
                    ID (permanent)
                    <input type="text" disabled={!isNew} value={id} ref={idRef} onChange={e=>{
                        if(isNew) {
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
                <LazyDropDownSelect
                    callback={()=> {
                        if(!(controllerTypes instanceof Array)) { // If the list has been loaded before, do not show 'Loading'. Do so otherwise
                            setControllerTypes(0);
                        }
                        return sendRequest({
                            type: 'rooms.controllers.getRoomControllerTypes'
                        }).then(res=> {
                            if(res.type==='ok') {
                                setControllerTypes(res.data.types);
                                return res.data.types.map(type=>({
                                    value: type.id,
                                    label: type.name,
                                    subtext: type.sub_name
                                }));
                            } else {
                                handleError(res);
                                setControllerTypes(-1);
                                return {error: false}; // It'll only be true if error is from a plugin, and this request does not return a plugin error.
                            }
                        }, err=> {
                            handleError(err);
                            setControllerTypes(-1);
                            return {error: false};
                        });
                    }}
                    onChange={onChangeControllerType}
                    lazyOptions={{
                        isLazy: true,
                        loadOn: 'render',
                        fallbackTexts: {
                            whenEmpty: 'No room controller types found',
                            whenError: 'Error loading room controller types'
                        }
                    }}
                    value={controller.type}
                />

                <Fields 
                    fields={fields} 
                    fieldErrors={fieldErrors} 
                    fieldValues={controller.settings} 
                    setFieldValues={settings => setController(controller => ({...controller, settings}))} 
                    setFieldErrors={setFieldErrors}
                    context={{
                        for: "roomController",
                        controller: controller.type
                    }} 
                />

            </fieldset>

            <IntermittentableButton<HMApi.Response<HMApi.RequestAddRoom|HMApi.RequestEditRoom>>
                primary className='save' onClick={onSave} onThen={onSaveSuccess} onCatch={onSaveError}>
                <FontAwesomeIcon icon={faSave} /> Save
            </IntermittentableButton>
        </div>
    );
}

export default connect(({rooms}: StoreState)=> ({rooms}))(SettingsPageRoomsEditRoom);
