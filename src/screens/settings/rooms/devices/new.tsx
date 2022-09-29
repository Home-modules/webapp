import { faArrowLeft, fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, Navigate, Outlet, useMatch, useParams } from "react-router-dom";
import './new.scss';
import './edit-device';
import { StoreState } from "../../../../store";
import { connect } from "react-redux";
import React from "react";
import ScrollView from "../../../../ui/scrollbar";
import { PlaceHoldersArray } from "../../../../ui/placeholders";

function SettingsPageRoomsDevicesNewDevice({deviceTypes, rooms}: Pick<StoreState, 'deviceTypes'|'rooms'>) {
    let hideList = !useMatch('/settings/rooms/:roomId/devices/new/');
    const {roomId= ''} = useParams();
    const controllerType = rooms ? (rooms.find(r=> r.id === roomId)?.controllerType || false) : undefined;
    const types = controllerType && deviceTypes[controllerType.type];

    if(!roomId) {
        return <Navigate to="/settings/rooms" />
    }

    return (
        <main className="new-device">
            <ScrollView className={`choose-type ${hideList ? 'hidden' : ''}`}>
                <h1>
                    <Link to="..">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Link>
                    New device
                </h1>
                <div className="subtitle">
                    Select device type
                </div>
                <PlaceHoldersArray
                    className="device-types"
                    items={types}
                    Wrapper={types => (
                        <div className="device-types">
                            {types.map(type => (
                                <Link key={type.id} to={type.id} className="button">
                                    <FontAwesomeIcon icon={fas['fa'+type.icon]} />
                                    {type.name}
                                </Link>
                            ))}
                        </div>
                    )}
                    loadingPlaceholder="Loading device types"
                    errorPlaceholder="Error loading device types"
                    emptyPlaceholder={(
                        <p>
                            No device type is available at the moment. Go to <Link to="/settings/plugins">plugin settings</Link> and install/activate a plugin to add device types to this list.
                        </p>
                    )}
                />
            </ScrollView>
            <Outlet />
        </main>
    );
}

export default connect(({deviceTypes, rooms}: StoreState) => ({deviceTypes, rooms}))(SettingsPageRoomsDevicesNewDevice);