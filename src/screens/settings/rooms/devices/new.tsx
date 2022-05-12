import { faArrowLeft, fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, Navigate, Outlet, useMatch, useParams } from "react-router-dom";
import './new.scss';
import './edit-device';
import { store, StoreState } from "../../../../store";
import { connect } from "react-redux";
import React from "react";
import { handleError, sendRequest } from "../../../../comms/request";

function SettingsPageRoomsDevicesNewDevice({deviceTypes, rooms}: Pick<StoreState, 'deviceTypes'|'rooms'>) {
    let hideList = !useMatch('/settings/rooms/:roomId/devices/new/');
    const {roomId= ''} = useParams();
    const controllerType = rooms ? rooms.find(r=> r.id === roomId)?.controllerType : undefined;
    const types = controllerType ? deviceTypes[controllerType.type] : false;

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

    if(!roomId) {
        return <Navigate to="/settings/rooms" />
    }

    return (
        <main className="new-device">
            <div className={`choose-type ${hideList ? 'hidden' : ''}`}>
                <h1>
                    <Link to="..">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Link>
                    New device
                </h1>
                <div className="subtitle">
                    Select device type
                </div>
                <div className="device-types">
                    {types === undefined ?
                        <div className="loading">
                            Loading device types...
                        </div>
                    : types === false ? 
                        <div className="error">
                            Error loading device types
                        </div>
                    : types.map(type => (
                        <Link key={type.id} to={type.id} className="button">
                            <FontAwesomeIcon icon={fas['fa'+type.icon]} />
                            {type.name}
                        </Link>
                    ))}
                </div>
            </div>
            <Outlet />
        </main>
    );
}

export default connect(({deviceTypes, rooms}: StoreState) => ({deviceTypes, rooms}))(SettingsPageRoomsDevicesNewDevice);