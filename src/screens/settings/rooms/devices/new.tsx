import { faArrowLeft, faChevronRight, fas, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, Navigate, Outlet, useMatch, useParams } from "react-router-dom";
import './new.scss';
import './edit-device';
import { StoreState } from "../../../../store";
import { connect } from "react-redux";
import React from "react";
import ScrollView from "../../../../ui/scrollbar";
import { PlaceHoldersArray } from "../../../../ui/placeholders";
import { HMApi } from "../../../../hub/api";
import Button from "../../../../ui/button";
import { Header, PageWithHeader } from "../../../../ui/header";

function SettingsPageRoomsDevicesNewDevice({deviceTypes, rooms}: Pick<StoreState, 'deviceTypes'|'rooms'>) {
    let hideList = !useMatch('/settings/devices/:roomId/new/');
    const {roomId= ''} = useParams();
    const controllerType = rooms ? (rooms.find(r=> r.id === roomId)?.controllerType || false) : undefined;
    const types = controllerType && deviceTypes[controllerType.type];
    const [currentSuperType, setCurrentSuperType] = React.useState<[HMApi.T.DeviceType[], number, number] | null>(null);
    const [currentSuperTypeClosing, setCurrentSuperTypeClosing] = React.useState(false);
    const deviceTypesDivRef = React.useRef<HTMLDivElement>(null);

    if(!roomId) {
        return <Navigate to="/settings/devices" />
    }

    return (
        <main className="new-device">
            <PageWithHeader
                title="New Device"
                subtitle="Select device type"
                backLink=".."
                className={`choose-type ${hideList ? 'hidden' : ''}`}
            >
                <PlaceHoldersArray
                    className="device-types"
                    items={types}
                    Wrapper={types => (
                        <div className="device-types" ref={deviceTypesDivRef}>
                            {currentSuperType && (
                                <div className={`super-type ${currentSuperTypeClosing?'closing':''}`} style={{
                                    transformOrigin: `${currentSuperType[1]}px ${currentSuperType[2]}px`
                                }}>
                                    <FontAwesomeIcon icon={faTimes} className="close" onClick={() => {
                                        setCurrentSuperTypeClosing(true);
                                        setTimeout(() => {
                                            setCurrentSuperType(null);
                                            setCurrentSuperTypeClosing(false);
                                        }, 500);
                                    }} />
                                    <h2>{currentSuperType[0][0].name}</h2>
                                    <div className="items">
                                        {currentSuperType[0].map((type)=> (
                                            <Link key={type.id} to={type.id} className="button">
                                                <FontAwesomeIcon icon={fas['fa' + type.icon]} />
                                                <div>{type.sub_name}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {categorizeDeviceTypes(types).map(([i, category]) => (
                                <div className="category" key={i}>
                                    {Object.entries(category).map(([superType, types]) => (types.length > 1 ) ? (
                                        <Button key={superType} onClick={(e) => {
                                            const buttonPos = (e.target as HTMLButtonElement).getBoundingClientRect();
                                            const divPos = deviceTypesDivRef.current!.getBoundingClientRect();
                                            setCurrentSuperType([types,
                                                (buttonPos.x + buttonPos.width / 2) - divPos.x,
                                                (buttonPos.y + buttonPos.height / 2) - divPos.y
                                            ]);
                                        }}>
                                            <FontAwesomeIcon icon={fas['fa' + types[0].icon]} />
                                            <div className="name">{types[0].name}</div>
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </Button>
                                    ) : (
                                        <Link key={superType} to={types[0].id} className="button">
                                            <FontAwesomeIcon icon={fas['fa' + types[0].icon]} />
                                                <div className="text">
                                                    <div className="name">{types[0].name}</div>
                                                    <div className="sub-name">{types[0].sub_name}</div>
                                                </div>
                                        </Link>
                                    ))}
                                </div>
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
            </PageWithHeader>
            <Outlet />
        </main>
    );
}

export default connect(({deviceTypes, rooms}: StoreState) => ({deviceTypes, rooms}))(SettingsPageRoomsDevicesNewDevice);

function categorizeDeviceTypes(types: HMApi.T.DeviceType[]) {
    function groupSubTypes(types: HMApi.T.DeviceType[]) {
        const res: Record<string, HMApi.T.DeviceType[]> = {};
        for (const type of types) {
            const [super_type] = type.id.split(':');
            if (super_type in res) {
                res[super_type].push(type);
            } else {
                res[super_type] = [type];
            }
        }
        return res;
    }

    const cat1 = types.filter(type => !type.forRoomController.includes('*')); // super_type:sub_type, Compatible with a single room controller type
    const cat2 = types.filter(type => type.forRoomController.endsWith('*') && type.forRoomController !== '*'); // super_type:*, Compatible with a room controller type family
    const cat3 = types.filter(type => type.forRoomController === '*'); // Compatible with all room controller types
    const res: [number, Record<string, HMApi.T.DeviceType[]>][] = [];
    if (cat1.length) res.push([1, groupSubTypes(cat1)]);
    if (cat2.length) res.push([2, groupSubTypes(cat2)]);
    if (cat3.length) res.push([3, groupSubTypes(cat3)]);
    return res;
}