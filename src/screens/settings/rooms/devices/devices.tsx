import { faArrowLeft, faPlus, fas, faSearch, faTimes, faTimesCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { connect } from "react-redux";
import { Link, Navigate, Outlet, useMatch, useParams, useSearchParams } from "react-router-dom";
import { ReactSortable, Store } from "react-sortablejs";
import Sortable from "sortablejs";
import { HMApi } from "../../../../hub/api";
import { handleError, sendRequest } from "../../../../hub/request";
import { store, StoreState } from "../../../../store";
import { addConfirmationFlyout } from "../../../../ui/flyout";
import { PlaceHolders } from "../../../../ui/placeholders";
import ScrollView from "../../../../ui/scrollbar";
import SearchKeywordHighlight from "../../../../ui/search-highlight";
import './devices.scss';

function SettingsPageRoomsDevices({rooms, devices: allDevices, deviceTypes}: Pick<StoreState, 'rooms'|'devices'|'deviceTypes'>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const search= searchParams.get('search');
    const searchFieldRef = React.useRef<HTMLInputElement>(null);
    
    const [selectedDevices, setSelectedDevices] = React.useState<string[]>([])

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

    function updateDevices() {
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
    }

    React.useEffect(updateDevices , [hideList, roomId, setDevices]);

    React.useEffect(()=> {
        if ((!types) && roomId && controllerType) {
            sendRequest({
                type: "devices.getDeviceTypes",
                controllerType: controllerType.type
            }).then(res => {
                if (res.type === 'ok') {
                    store.dispatch({
                        type: "SET_DEVICE_TYPES",
                        roomController: controllerType.type,
                        deviceTypes: res.data.types
                    });
                } else {
                    handleError(res);
                }
            }, handleError);
        }
    }, [types, roomId, controllerType]);

    function onSort(evt: Sortable.SortableEvent, sortable: Sortable | null, store: Store) {
        if(devices) {
            sendRequest({
                type: 'devices.changeDeviceOrder',
                roomId,
                ids: devices.map(device=>device.id)
            }).catch(handleError)
        }
    }

    if (!roomExists) {
        if (searchParams.has('redirect')) { // Don't override the redirect if it's already set
            return <Navigate to={`/settings/rooms?redirect=${searchParams.get('redirect')}`} />;
        } else if(!hideList) {
            return <Navigate to={`/settings/rooms?redirect=/settings/rooms/${roomId}/devices`} />;
        }
    }

    if (devices && types && searchParams.has('redirect')) {
        return <Navigate to={searchParams.get('redirect')!} replace />
    }

    return (
        <div className="edit-devices">
            <ScrollView className={`devices-list ${hideList? 'hidden':''}`}>
                <h1 className={`searchable ${search===null ? '' : 'search-active'} ${selectedDevices.length===0 ? '' : 'selected-active'}`}>
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
                    <div className="selected">
                        <label className="checkbox">
                            <input 
                                type="checkbox" 
                                checked={devices ? selectedDevices.length === devices.length: false}
                                onChange={e=> {
                                    if(devices && e.target.checked) {
                                        setSelectedDevices(devices.map(r=>r.id));
                                    } else {
                                        setSelectedDevices([]);
                                    }
                                }} 
                                title="Select all"
                            />
                        </label>
                        <span>{selectedDevices.length}</span>
                        <FontAwesomeIcon icon={faTrash} onClick={e=> {
                            addConfirmationFlyout({
                                element: e.target,
                                text: `Are you sure you want to delete ${selectedDevices.length} ${selectedDevices.length===1 ? 'device':'devices'}?`,
                                confirmText: "Delete",
                                attention: true,
                                async: true,
                                onConfirm: ()=> (async()=> {
                                    const devices = [...selectedDevices]; // Clone array it case it changes during the process
                                    for(const deviceId of devices) {
                                        await sendRequest({
                                            type: "devices.removeDevice",
                                            roomId,
                                            id: deviceId
                                        });
                                    }
                                    store.dispatch({
                                        type: "ADD_NOTIFICATION",
                                        notification: {
                                            type: "success",
                                            message: `Deleted ${devices.length} ${devices.length===1?'device':'devices'}`
                                        }
                                    });
                                    updateDevices();
                                    setSelectedDevices([]);
                                })().catch(handleError)
                            });
                        }}/>
                        <FontAwesomeIcon icon={faTimes} onClick={()=>setSelectedDevices([])} />
                    </div>
                </h1>
                <div className='list'>
                    <PlaceHolders
                        content={devices}
                        Wrapper={devices => (
                            search ? <>{
                                devices
                                    .filter(device => (device.name.toLowerCase().includes(search.toLowerCase()) || device.id.toLowerCase().includes(search.toLowerCase())))
                                    .map(device => (
                                        <DeviceItem
                                            key={device.id}
                                            device={device}
                                            disableReorder
                                            search={search}
                                            deviceType={types ? types.find(t => t.id === device.type) : undefined}
                                            action={selectedDevices.length === 0 ? 'edit' : 'check'}
                                            selected={selectedDevices.includes(device.id)}
                                            onSelectChange={() => {
                                                if (selectedDevices.includes(device.id)) {
                                                    setSelectedDevices(val => val.filter(el => el !== device.id));
                                                } else {
                                                    setSelectedDevices(val => [...val, device.id])
                                                }
                                            }}
                                        />
                                    ))
                            }</> : <>
                                <ReactSortable
                                    list={devices} setList={setDevices} onSort={onSort}
                                    animation={200} easing='ease'
                                    handle='.drag-handle' ghostClass='ghost'>
                                    {devices.map(device => (
                                        <DeviceItem
                                            key={device.id}
                                            device={device}
                                            deviceType={types ? types.find(t => t.id === device.type) : undefined}
                                            action={selectedDevices.length === 0 ? 'edit' : 'check'}
                                            selected={selectedDevices.includes(device.id)}
                                            onSelectChange={() => {
                                                if (selectedDevices.includes(device.id)) {
                                                    setSelectedDevices(val => val.filter(el => el !== device.id));
                                                } else {
                                                    setSelectedDevices(val => [...val, device.id])
                                                }
                                            }}
                                        />
                                    ))}
                                </ReactSortable>
                                <Link to="new" className="add">
                                    <FontAwesomeIcon icon={faPlus} />
                                </Link>
                            </>
                        )}
                        errorPlaceholder="Error loading devices"
                    />
                </div>
            </ScrollView>
            <Outlet />
        </div>
    )
}

export default connect(({rooms, devices, deviceTypes}: StoreState)=>({rooms, devices, deviceTypes}))(SettingsPageRoomsDevices);

type DeviceItemProps = {
    device: HMApi.T.Device,
    deviceType?: HMApi.T.DeviceType,
    disableReorder?: boolean,
    search?: string, // Search keyword for highlighting
    action: "edit"|"check",
    selected: boolean,
    onSelectChange: ()=>void
}

function DeviceItem({device, deviceType, disableReorder, search, action, onSelectChange, selected}: DeviceItemProps) {
    return (
        <div className='item'>
            {(!disableReorder) && (
                <svg className='drag-handle' width="16" height="16">
                    <path fillRule="evenodd" d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z"></path>
                </svg>
            )}
            <Link 
                to={`edit/${device.id}`} 
                className={`open ${action==='check'? 'checkbox-visible': ''}`}
                onClick={e=> {
                    if(action==='check') {
                        e.preventDefault();
                        onSelectChange();
                    }
                }}
                onContextMenu={e=> {
                    if(navigator.maxTouchPoints && action==='edit') { // Only on mobile devices and when select mode is off
                        e.preventDefault();
                        onSelectChange();
                    }
                }}
            >
                <span className='name'>
                    {deviceType && <FontAwesomeIcon icon={fas['fa'+deviceType.icon]} fixedWidth />}
                    <label className="checkbox">
                        <input 
                            type="checkbox" 
                            checked={selected} 
                            onClick={e=> {e.stopPropagation()}} 
                            onChange={onSelectChange}
                        />
                    </label>
                    <SearchKeywordHighlight term={search}>{device.name}</SearchKeywordHighlight>
                </span>
                <span className='id'>
                    <SearchKeywordHighlight term={search}>{device.id}</SearchKeywordHighlight>
                </span>
            </Link>
        </div>
    );
}
