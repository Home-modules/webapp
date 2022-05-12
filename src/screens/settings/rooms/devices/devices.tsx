import { faArrowLeft, faPlus, faSearch, faTimes, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { connect } from "react-redux";
import { Link, Navigate, Outlet, useMatch, useParams, useSearchParams } from "react-router-dom";
import { HMApi } from "../../../../comms/api";
import { handleError, sendRequest } from "../../../../comms/request";
import { store, StoreState } from "../../../../store";
import SearchKeywordHighlight from "../../../../ui/search-highlight";
import './devices.scss';

function SettingsPageRoomsDevices({rooms, devices: allDevices, deviceTypes}: Pick<StoreState, 'rooms'|'devices'|'deviceTypes'>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const search= searchParams.get('search');
    const searchFieldRef = React.useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
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
    const devices= allDevices[roomId];
    const controllerType = rooms ? rooms.find(r=> r.id === roomId)?.controllerType : undefined;
    const types = controllerType ? deviceTypes[controllerType.type] : false;

    let hideList = useMatch('/settings/rooms/:roomId/devices/new');
    hideList = useMatch('/settings/rooms/:roomId/devices/new/:deviceType') || hideList;
    hideList = useMatch('/settings/rooms/:roomId/devices/edit/:deviceId') || hideList;

    const setDevices= React.useCallback(function setDevices(devices: StoreState['devices'][string]) {
        store.dispatch({
            type: 'SET_DEVICES',
            devices,
            roomId
        });
    }, [roomId]);

    React.useEffect(()=> {
        sendRequest({
            type: 'devices.getDevices',
            roomId
        }).then(res => {
            if(res.type==='ok') {
                setDevices(Object.values(res.data.devices));
            }
            else {
                setDevices(false);
                handleError(res);
            }
        }).catch(err=> {
            setDevices(false);
            handleError(err);
        });
    }, [hideList, roomId, setDevices]);

    React.useEffect(() => {
        if((!types) && roomId && controllerType) {
            sendRequest({
                type: "devices.getDeviceTypes",
                controllerType: controllerType.type
            }).then(res=> {
                if(res.type === 'ok') {
                    store.dispatch({
                        type: "SET_DEVICE_TYPES",
                        roomController: controllerType.type,
                        deviceTypes: res.data.types
                    });
                } else {
                    handleError(res);
                }
            }, handleError)
        }
    }, [types, roomId, controllerType]);

    if(!roomExists) {
        return <Navigate to="/settings/rooms" />
    }

    return (
        <div className="edit-devices">
            <div className={`devices-list ${hideList? 'hidden':''}`}>
                <h1 className={`searchable ${search===null ? '' : 'search-active'}`}>
                    <div className="title">
                        <Link to="/settings/rooms">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                        <span>{room.name} devices</span>
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
                    {devices === undefined ? (
                        <div className="loading">
                            <span className="circle" />
                            Loading...
                        </div>
                    ) : devices === false ? (
                        <div className="error">
                            <FontAwesomeIcon icon={faTimesCircle} />
                            Error loading rooms
                        </div>
                    ) : search ? (
                        devices
                            .filter(device=>(device.name.toLowerCase().includes(search.toLowerCase()) || device.id.toLowerCase().includes(search.toLowerCase())))
                            .map(device => (
                                <DeviceItem key={device.id} device={device} roomId={roomId} disableReorder search={search} />
                            ))
                    ) : (<>
                        {/* <ReactSortable 
                            list={rooms} setList={setRooms} onSort={onSort}
                            animation={200} easing='ease' 
                            handle='.drag-handle' ghostClass='ghost'> */}
                            {devices.map(device => (
                                <DeviceItem key={device.id} device={device} roomId={roomId} disableReorder />
                            ))}
                        {/* </ReactSortable> */}
                        <Link to="new" className="add">
                            <FontAwesomeIcon icon={faPlus} />
                        </Link>
                    </>)}
                </div>
            </div>
            <Outlet />
        </div>
    )
}

export default connect(({rooms, devices, deviceTypes}: StoreState)=>({rooms, devices, deviceTypes}))(SettingsPageRoomsDevices);

type DeviceItemProps = {
    device: HMApi.Device,
    roomId: string,
    disableReorder?: boolean,
    search?: string // Search keyword for highlighting
}

function DeviceItem({device, roomId, disableReorder, search}: DeviceItemProps) {
    // const icons: Record<HMApi.Device['type'], IconDefinition> = {
    //     'light': faLightbulb,
    //     'outlet': faPlug,
    //     'fan': faFan,
    //     'switch': faToggleOff, // TODO: could not find a better icon
    //     'dimmer': faSliders, // TODO: could not find a better icon
    //     'thermostat': faTemperatureHigh,
    //     'door': faDoorOpen,
    //     'photo-resistor': faLightbulb, // TODO: could not find a better icon
    //     'power-wall': faBattery // FontAwesome doesn't have an icon for Tesla
    // }
    // const icon= icons[device.type];

    return (
        <div className='item'>
            {(!disableReorder) && (
                <svg className='drag-handle' width="16" height="16">
                    <path fillRule="evenodd" d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z"></path>
                </svg>
            )}
            <Link to={`edit/${device.id}`} className='open'>
                <span className='name'>
                    {/* <FontAwesomeIcon icon={icon} fixedWidth /> */}
                    <SearchKeywordHighlight term={search}>{device.name}</SearchKeywordHighlight>
                </span>
                <span className='id'>
                    <SearchKeywordHighlight term={search}>{device.id}</SearchKeywordHighlight>
                </span>
            </Link>
        </div>
    );
}
