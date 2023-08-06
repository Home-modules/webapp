import React, { Dispatch, useEffect, useState } from "react"
import { HMApi } from "../../../hub/api"
import { StoreState, store } from "../../../store";
import Button, { IconButton } from "../../../ui/button";
import { handleError, sendRequest } from "../../../hub/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "./action-trigger.scss";
import { uniqueId } from "../../../utils/uniqueId";
import Fields, { getFieldsErrors, getSettingsFieldsDefaultValues } from "../../../ui/fields/fields";
import getFlatFields from "../../../utils/flat-fields";
import { LazyDropDownSelect } from "../../../ui/dropdown/lazy";
import { refreshRooms } from "../rooms/rooms";
import { refreshDevices } from "../rooms/devices/devices";
import DropDownSelect from "../../../ui/dropdown/dropdown";
import { connect } from "react-redux";
import { SettingItemTextSelect } from "../../../ui/settings/text-select";

type EditActionProps = {
    action: HMApi.T.Automation.Action | { type: "" },
    onSubmit: Dispatch<HMApi.T.Automation.Action>
}

const EditAction = connect(({ routines }: StoreState) => ({ routines }))(EditAction_);

function EditAction_({ action, onSubmit, routines }: EditActionProps & Pick<StoreState, "routines">) {
    const [obj, setObj] = useState(action);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
    const [globalActions, setGlobalActions] = useState<HMApi.T.Automation.GlobalActionType[]>([]);
    useEffect(() => {
        sendRequest({
            type: "automation.getGlobalActions"
        }).then(res => setGlobalActions(res.data.actions), handleError);
    }, []);

    switch (obj.type) {
        case "":
            return (
                <div className="select-action-type">
                    <Button
                        className="devices"
                        onClick={() => setObj({
                            type: "deviceAction",
                            action: "", device: "", room: "", options: {}
                        })}
                    >
                        Devices
                        <FontAwesomeIcon icon={faChevronRight} />
                    </Button>
                    <Button onClick={() => setObj({ type: "triggerRoutine", routine: 0 })}>
                        Trigger another routine
                    </Button>
                    {globalActions.map(type => (
                        <Button
                            key={type.id}
                            onClick={() => setObj({
                                type: "globalAction",
                                name: type.id,
                                options: getSettingsFieldsDefaultValues(getFlatFields(type.fields))
                            })}
                        >
                            {type.name}
                        </Button>
                    ))}
                </div>
            );

        case "globalAction": {
            const type = globalActions.find(a => a.id === obj.name);
            if (!type) return <></>;
            return (
                <div className="global-action">
                    <h2>
                        <IconButton icon={faArrowLeft} onClick={() => setObj({ type: "" })} />
                        <span>{type.name}</span>
                    </h2>
                    <div className="settings">
                        <Fields
                            context={{ for: "globalAction", id: type.id }}
                            fields={type.fields}
                            fieldValues={obj.options}
                            setFieldValues={v => setObj(o => ({ ...o, options: v }))}
                            fieldErrors={fieldErrors}
                            setFieldErrors={setFieldErrors}
                        />
                    </div>
                    <Button primary className="save"
                        onClick={() => {
                            const [hasError, errors] = getFieldsErrors(getFlatFields(type.fields), obj.options);
                            setFieldErrors({});
                            if (hasError) {
                                window.setTimeout(() => { // Combined with the code two lines above here, this causes the existing errors to be removed and set again, causing the shake animations to repeat.
                                    setFieldErrors(errors);
                                });
                                return Promise.reject();
                            }

                            onSubmit(obj);
                        }}
                    >
                        Save
                    </Button>
                </div>
            )
        }

        case "deviceAction": {
            if (!obj.action) {
                return (
                    <div className="select-device-action">
                        <h2>
                            <IconButton icon={faArrowLeft} onClick={() => setObj({ type: "" })} />
                            <span>Device actions</span>
                        </h2>
                        <div className="select-room-device">
                            <div className="select-room">
                                <span>Room</span>
                                <LazyDropDownSelect
                                    lazyOptions={{ isLazy: true, loadOn: "render" }}
                                    callback={async () => {
                                        let rooms = store.getState().rooms;
                                        if (!rooms) {
                                            await refreshRooms();
                                            rooms = store.getState().rooms;
                                        }
                                        return rooms ?
                                            rooms.map(r => ({ value: r.id, label: r.name, subtext: r.id }))
                                            : { error: true };
                                    }}
                                    value={obj.room}
                                    onChange={(room) => setObj(obj => ({ ...obj, room, device: "" }))}
                                />
                            </div>
                            <div className="select-device">
                                <span>Device</span>
                                <DeviceDropdown
                                    room={obj.room}
                                    device={obj.device}
                                    onChange={(room, device) => setObj(obj => ({ ...obj, room, device }))}
                                />
                            </div>
                        </div>
                        <div className="select-action">
                            {(obj.room && obj.device) && <>
                                <h3>Available actions</h3>
                                <ProvideDeviceType room={obj.room} device={obj.device}>
                                    {(deviceType) => deviceType.hasMainToggle ? (
                                        <Button
                                            onClick={() => setObj(obj => ({
                                                ...obj as HMApi.T.Automation.Action.DeviceAction,
                                                type: "toggleDeviceMainToggle"
                                            }))}
                                        >
                                            Turn on/off
                                        </Button>
                                    ) : <></>}
                                </ProvideDeviceType>
                            </>}
                        </div>
                    </div>
                )
            }
            else return <></>
        }

        case "toggleDeviceMainToggle": {
            return (
                <div className="device-action-options">
                    <h2>
                        <IconButton icon={faArrowLeft}
                            onClick={() => setObj(obj => ({ ...obj as HMApi.T.Automation.Action.DeviceAction, type: "deviceAction" }))} />
                        <span>
                            <RoomAndDeviceName roomId={obj.room} deviceId={obj.device} />
                            <> <FontAwesomeIcon icon={faChevronRight} /> </>
                            Turn on/off
                        </span>
                    </h2>
                    <div className="settings">
                        <SettingItemTextSelect
                            title="Type"
                            onChange={val => setObj(obj => ({
                                ...obj as HMApi.T.Automation.Action.ToggleDeviceMainToggle,
                                setTo: { on: true, off: false, toggle: undefined }[val]
                            }))}
                            options={{
                                on: "Turn on",
                                off: "Turn off",
                                toggle: "Toggle"
                            }}
                            value={obj.setTo === undefined ? "toggle" : obj.setTo ? "on" : "off"}
                        />
                    </div>

                    <Button primary className="save" onClick={() => onSubmit(obj)}>
                        Save
                    </Button>
                </div>
            )
        }

        case "triggerRoutine": {
            const suitableRoutines = routines ?
                routines.order
                    .map(i => routines.routines[i])
                    .filter(r => r.allowTriggerByOtherRoutine)
                : [];
            return (
                <div className="select-routine">
                    <h2>
                        <IconButton icon={faArrowLeft} onClick={() => setObj({ type: "" })} />
                        <span>Trigger another routine</span>
                    </h2>
                    {/** The list of routines is already loaded, else the user couldn't open this dialog */}
                    <div className="list">
                        {suitableRoutines.map(routine => (
                            <Button onClick={() => {
                                const newObj = { ...obj, routine: routine.id };
                                setObj(newObj); // is it necessary?
                                onSubmit(newObj);
                            }}>
                                {routine.name}
                            </Button>
                        ))}
                        {suitableRoutines.length === 0 ? (
                            <div className="notice">
                                No suitable routines found
                            </div>
                        ) : <></>}
                    </div>
                </div>
            )
        }

        default: return <></>
    }
}

export const RoomName = connect(({ rooms }: StoreState) => ({ rooms }))(
    function RoomName(
        { rooms, roomId }:
            (Pick<StoreState, "rooms">
                & { roomId: string })
    ) {
        const roomName = (rooms ? rooms.find(r => r.id === roomId)?.name : undefined) || roomId;
        useEffect(() => {
            if (!rooms) refreshRooms();
        }, []);

        return <>{roomName}</>;
    }
)
export const RoomAndDeviceName = connect(({ rooms, devices }: StoreState) => ({ rooms, devices }))(
    function RoomAndDeviceName(
        { rooms, devices, roomId, deviceId }:
            (Pick<StoreState, "rooms" | "devices">
                & { roomId: string, deviceId: string })
    ) {
        const roomName = (rooms ? rooms.find(r => r.id === roomId)?.name : undefined) || roomId;
        const devicesInRoom = devices[roomId] || undefined;
        const deviceName = devicesInRoom?.find(d => d.id === deviceId)?.name || deviceId;
        useEffect(() => {
            if (!rooms) refreshRooms();
        }, []);
        useEffect(() => {
            if (!devices[roomId]) refreshDevices(roomId);
        }, [roomId]);

        return <>{roomName} <FontAwesomeIcon icon={faChevronRight} /> {deviceName}</>
    }
)

export type DeviceDropdownProps = {
    room: string,
    device: string,
    onChange: (room: string, device: string) => void
}

export function DeviceDropdown({ room, device, onChange }: DeviceDropdownProps) {
    const [options, setOptions] = React.useState<HMApi.T.SettingsField.SelectOption[]>([]);
    const updateItems = async () => {
        if (!room) {
            setOptions([]); //TODO
        } else {
            let devices = store.getState().devices[room];
            if (!devices) {
                await refreshDevices(room);
                devices = store.getState().devices[room];
            }
            setOptions(devices ?
                devices.map(r => ({ value: (room + "." + r.id), label: r.name, subtext: r.id }))
                : []);
        }
    };
    useEffect(() => { updateItems() }, [room]);

    return (
        <DropDownSelect
            value={(room && device) ? room + "." + device : ""}
            onChange={(val) => {
                const [room = "", device = ""] = val.split('.');
                onChange(room, device);
            }}
            options={options}
        />
    )
}

export type ProvideDeviceTypeProps = {
    room: string,
    device: string,
    children: (type: HMApi.T.DeviceType) => JSX.Element;
}

export function ProvideDeviceType({ room, device, children }: ProvideDeviceTypeProps) {

    const [deviceType, setDeviceType] = React.useState<HMApi.T.DeviceType | undefined>();

    useEffect(() => {
        sendRequest({
            type: "devices.getDeviceType",
            deviceId: device,
            roomId: room
        }).then(res => setDeviceType(res.data.type), handleError);
    }, [room, device])

    return deviceType ? children(deviceType) : <></>;
}

export function editAction(
    index: number | "new",
    actions: HMApi.T.Automation.Action[],
    setActions: React.Dispatch<React.SetStateAction<HMApi.T.Automation.Action[]>>
) {
    const id = uniqueId();
    store.dispatch({
        type: "ADD_DIALOG",
        id,
        dialog: {
            children: (({ close }) => (
                <EditAction
                    action={index === "new" ? { type: "" } : actions[index]}
                    onSubmit={ac => {
                        setActions(acs => index === "new" ?
                            [...acs, ac] :
                            [
                                ...acs.slice(0, index),
                                ac,
                                ...acs.slice(index + 1)
                            ]);
                        close();
                    }}
                />
            )),
            cancellable: false,
            title: index === "new" ? "Add Action" : "Edit Action",
            className: "automation-routine-dialog action",
            showCloseButton: true,
        }
    });
    return id;
}

export function ActionName({ action, routines }: { action: HMApi.T.Automation.Action, routines: Record<number, HMApi.T.Automation.Routine> }) {
    switch (action.type) {
        case "deviceAction":
            return <><RoomAndDeviceName roomId={action.room} deviceId={action.device} /> <FontAwesomeIcon icon={faChevronRight} /> {action.action}</>
        case "toggleDeviceMainToggle":
            return <><RoomAndDeviceName roomId={action.room} deviceId={action.device} /> <FontAwesomeIcon icon={faChevronRight} /> {action.setTo === undefined ? "Toggle" : action.setTo ? "Turn on" : "Turn off"}</>
        case "globalAction":
            return <>{action.name}</>
        case "triggerRoutine":
            return <>Trigger routine: {routines[action.routine].name}</>
    }
}
