import './room-edit.scss';
import { HMApi } from "../../../hub/api";
import { faBath, faBed, faCouch, faDoorClosed, faTrash, faUtensils, IconName } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { IntermittentButton } from '../../../ui/button';
import { handleError, sendRequest } from '../../../hub/request';
import { StoreState } from '../../../store';
import { Navigate, useMatch, useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import machineFriendlyName from '../../../utils/machine-friendly-name';
import Fields, { getFieldsErrors, getSettingsFieldDefaultValue } from '../../../ui/fields/fields';
import getFlatFields from '../../../utils/flat-fields';
import { addConfirmationFlyout } from '../../../ui/flyout';
import { SettingItemText } from '../../../ui/settings/text';
import { SettingItemIconSelect } from '../../../ui/settings/icon-select';
import { SettingItemLazyDropdown } from '../../../ui/settings/lazydropdown';
import { PageWithHeader } from '../../../ui/header';

export type SettingsPageRoomsEditRoomProps = {
    room: HMApi.T.Room & {new?: boolean};
    onClose: () => void;
    hidden?: boolean;
}

export const icons: Record<HMApi.T.Room['icon'], IconName> = {
    'living-room': 'couch',
    'kitchen': 'utensils',
    'bedroom': 'bed',
    'bathroom': 'bath',
    'other': 'door-closed'
}
const iconNames = Object.fromEntries(Object.entries(icons).map(([k,v])=>[v,k])) as Record<IconName, HMApi.T.Room['icon']>;

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
            type: '',
            settings: {

            }
        }
    };
    const navigate = useNavigate();

    const [name, setName] = React.useState(room.name);
    const [nameError, setNameError] = React.useState('');
    const nameRef = React.useRef<HTMLInputElement>(null);

    const [id, setId] = React.useState(room.id);
    const [idError, setIdError] = React.useState('');
    const idRef = React.useRef<HTMLInputElement>(null);

    const [icon, setIcon] = React.useState(icons[room.icon]);

    const [controller, setController] = React.useState(room.controllerType);
    const [controllerTypes, setControllerTypes] = React.useState<HMApi.T.RoomControllerType[] | 0 | -1>(0); // 0= loading -1= error
    const [controllerTypeError, setControllerTypeError] = React.useState('');

    const [fields, setFields] = React.useState<HMApi.T.SettingsField[]>([]);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string | undefined>>({});
    
    const saveButtonRef = React.useRef<HTMLButtonElement>(null);

    function onSave() {
        if (controller.type === '') {
            setControllerTypeError('Please select a room controller type & mode.');
            return Promise.reject();
        }
        const [hasError, errors] = getFieldsErrors(getFlatFields(fields), controller.settings);
        setFieldErrors({ });
        if(hasError) {
            window.setTimeout(()=> { // Combined with the code two lines above here, this causes the existing errors to be removed and set again, causing the shake animations to repeat.
                setFieldErrors(errors);
            });
            return Promise.reject();
        }
        
        const nRoom: HMApi.T.Room = {
            id,
            name,
            icon: iconNames[icon],
            controllerType: controller
        };

        return sendRequest({
            type: isNew ? 'rooms.addRoom' : 'rooms.editRoom',
            room: nRoom
        }).then(res=> {
            if(res.type==='ok') {
                navigate('/settings/rooms');
            }
            else {
                throw res;
            }
        }).catch((err: HMApi.ResponseOrError<HMApi.Request.Rooms.EditRoom|HMApi.Request.Rooms.AddRoom>) => {
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
        })
    }

    function onChangeControllerType(val?: string) { // val is not set when called by useEffect, and the existing settings must be kept in that case.
        if(!(controllerTypes instanceof Array)) return;
        const defaultRCType = room ? room.controllerType.type : '';
        const controller: HMApi.T.RoomController = {
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
    //eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(onChangeControllerType, [controllerTypes])

    React.useEffect(() => {
        if(!isNew)
            saveButtonRef.current?.parentElement?.parentElement?.parentElement?.focus();
    }, [isNew]);

    if(!(roomExists || isNew)) {
        return <Navigate to={`/settings/rooms?redirect=/settings/rooms/${roomId}/edit`} />
    }

    return (
        <PageWithHeader
            title={isNew ? "New room" : `Editing ${room.name}`}
            buttons={isNew ? [] : [{
                icon: faTrash,
                label: "Delete room",
                attention: true,
                onClick: e=> addConfirmationFlyout({
                    element: e.target,
                    text: "Are you sure you want to delete this room?",
                    confirmText: "Delete",
                    attention: true,
                    async: true,
                    onConfirm: ()=> sendRequest({
                        'type': 'rooms.removeRoom',
                        id
                    }).then(res=> {
                        if(res.type==='ok') {
                            navigate('/settings/rooms')
                        }
                        else handleError(res);
                    }, handleError)
                })
            }]}
            backLink="/settings/rooms"
            
            className="edit-room"
            onKeyDown={e => {
                console.log(e)
                if (e.ctrlKey && e.key === "s") {
                    e.preventDefault();
                    saveButtonRef.current ? saveButtonRef.current.click() : onSave();
                }
            }}
            tabIndex={-1}
        >
            <div className="options">
                <SettingItemText
                    title='Name'
                    value={name}
                    onChange={val => {
                        setName(val);
                        setNameError('');
                    }}
                    error={nameError}
                    onBlur={e => {
                        if (!id) {
                            // If the ID is empty, set it to a machine-friendly version of the name
                            setId(machineFriendlyName(e.target.value));
                        }
                    }}
                    autofocus={isNew}
                    iRef={nameRef}
                />
                <SettingItemText
                    title='ID'
                    description='Cannot be changed after saving'
                    value={id}
                    onChange={val => {
                        if (isNew) {
                            setId(val);
                            setIdError('');
                        }
                    }}
                    disabled={!isNew}
                    error={idError}
                    iRef={idRef}
                />

                <SettingItemIconSelect
                    title='Icon'
                    value={icon}
                    onChange={setIcon}
                    icons={[faCouch, faUtensils, faBed, faBath, faDoorClosed]}
                />

                <SettingItemLazyDropdown
                    title='Controller'
                    className='thick-border'
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
                                return {error: true}; 
                            }
                        }, err=> {
                            handleError(err);
                            setControllerTypes(-1);
                            return {error: true};
                        });
                    }}
                    onChange={onChangeControllerType}
                    lazyOptions={{
                        isLazy: true,
                        loadOn: 'render',
                        fallbackTexts: {
                            whenEmpty: 'No room controller types found. Go to plugin settings and activate a plugin to add room controller types to this list.',
                            whenError: 'Error loading room controller types'
                        }
                    }}
                    value={controller.type}
                    error={controllerTypeError}
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
            </div>

            <div className="save-container">
                <IntermittentButton
                    primary
                    className='save'
                    onClick={onSave}
                    buttonRef={saveButtonRef}
                >
                    Save
                </IntermittentButton>
            </div>
        </PageWithHeader>
    );
}

export default connect(({rooms}: StoreState)=> ({rooms}))(SettingsPageRoomsEditRoom);
