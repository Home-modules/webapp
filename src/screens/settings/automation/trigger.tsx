import React, { Dispatch, useEffect, useRef, useState } from "react"
import { HMApi } from "../../../hub/api"
import { StoreState, store } from "../../../store";
import Button, { IconButton } from "../../../ui/button";
import { handleError, sendRequest } from "../../../hub/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { uniqueId } from "../../../utils/uniqueId";
import Fields, { getFieldsErrors, getSettingsFieldsDefaultValues } from "../../../ui/fields/fields";
import getFlatFields from "../../../utils/flat-fields";
import { LazyDropDownSelect } from "../../../ui/dropdown/lazy";
import { refreshRooms } from "../rooms/rooms";
import { refreshDeviceTypes, refreshDevices } from "../rooms/devices/devices";
import DropDownSelect from "../../../ui/dropdown/dropdown";
import { connect } from "react-redux";
// import { SettingItemTextSelect } from "../../../ui/settings/text-select";
import { SettingItemText } from "../../../ui/settings/text";
import { DeviceDropdown, RoomAndDeviceName, RoomName } from "./action";

// I copy&pasted action.tsx,
// Replaced all instances of "Action" with "Trigger",
// Replaced functions with imports from action.tsx,
// And adjusted some stuff.

type EditTriggerProps = {
    trigger: HMApi.T.Automation.Trigger | { type: "" },
    onSubmit: Dispatch<HMApi.T.Automation.Trigger>
}

// const EditTrigger = connect(({ routines }: StoreState) => ({ routines }))(EditTrigger_);

function EditTrigger({ trigger, onSubmit }: EditTriggerProps) {
    const [obj, setObj] = useState(trigger);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
    const [globalTriggers, setGlobalTriggers] = useState<HMApi.T.Automation.GlobalTriggerType[]>([]);
    useEffect(() => {
        sendRequest({
            type: "automation.getGlobalTriggers"
        }).then(res => setGlobalTriggers(res.data.triggers), handleError);
    }, []);

    switch (obj.type) {
        case "":
            return (
                <div className="select-trigger-type">
                    <Button
                        className="devices"
                        onClick={() => setObj({
                            type: "deviceEvent",
                            event: "", device: "", room: "",
                        })}
                    >
                        Devices
                        <FontAwesomeIcon icon={faChevronRight} />
                    </Button>
                    <Button
                        className="manual"
                        onClick={() => setObj({ type: "manual", label: "" })}
                    >
                        Manual
                    </Button>
                    {globalTriggers.map(type => (
                        <Button
                            key={type.id}
                            onClick={() => setObj({
                                type: "globalTrigger",
                                name: type.id,
                                options: getSettingsFieldsDefaultValues(getFlatFields(type.fields))
                            })}
                        >
                            {type.name}
                        </Button>
                    ))}
                </div>
            );
        
        case "globalTrigger": {
            const type = globalTriggers.find(a => a.id === obj.name);
            if (!type) return <></>;
            return (
                <div className="global-trigger">
                    <h2>
                        <IconButton icon={faArrowLeft} onClick={() => setObj({ type: "" })} />
                        <span>{type.name}</span>
                    </h2>
                    <div className="settings">
                        <Fields
                            context={{ for: "globalTrigger", id: type.id }}
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
                            setFieldErrors({ });
                            if(hasError) {
                                window.setTimeout(()=> { // Combined with the code two lines above here, this causes the existing errors to be removed and set again, causing the shake animations to repeat.
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

        case "deviceEvent": {
            if (!obj.event) {
                return (
                    <div className="select-device-event">
                        <h2>
                            <IconButton icon={faArrowLeft} onClick={() => setObj({ type: "" })} />
                            <span>Device events</span>
                        </h2>
                        <div className="select-room-device">
                            <div className="select-room">
                                <span>Room</span>
                                <LazyDropDownSelect
                                    lazyOptions={{ isLazy: true, loadOn: "render" }}
                                    callback={async() => {
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
                                    onChange={(room) => setObj(obj => ({ ...obj, room, device: ""}))}
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
                        <div className="select-event">
                            {(obj.room && obj.device) && <>
                                <h3>Available events</h3>
                                {/* <ProvideDeviceType room={obj.room} device={obj.device}>
                                    {(deviceType)=> deviceType.hasMainToggle ? (
                                        <Button
                                            onClick={() => setObj(obj => ({
                                                ...obj as HMApi.T.Automation.Trigger.DeviceEvent,
                                                type: "toggleDeviceMainToggle"
                                            }))}
                                        >
                                            Turn on/off
                                        </Button>
                                    ): <></>}
                                </ProvideDeviceType> */}
                            </>}
                        </div>
                    </div>
                )
            }
            else return <></>
        }

        // case "toggleDeviceMainToggle": {
        //     return (
        //         <div className="device-trigger-options">
        //             <h2>
        //                 <IconButton icon={faArrowLeft}
        //                     onClick={() => setObj(obj => ({ ...obj as HMApi.T.Automation.Trigger.DeviceTrigger, type: "deviceTrigger" }))} />
        //                 <span>
        //                     <RoomAndDeviceName roomId={obj.room} deviceId={obj.device} />
        //                     <> <FontAwesomeIcon icon={faChevronRight} /> </>
        //                     Turn on/off
        //                 </span>
        //             </h2>
        //             <div className="settings">
        //                 <SettingItemTextSelect
        //                     title="Type"
        //                     onChange={val => setObj(obj => ({
        //                         ...obj as HMApi.T.Automation.Trigger.ToggleDeviceMainToggle,
        //                         setTo: { on: true, off: false, toggle: undefined }[val]
        //                     }))}
        //                     options={{
        //                         on: "Turn on",
        //                         off: "Turn off",
        //                         toggle: "Toggle"
        //                     }}
        //                     value={obj.setTo === undefined ? "toggle" : obj.setTo ? "on" : "off"}
        //                 />
        //             </div>

        //             <Button primary className="save" onClick={() => onSubmit(obj)}>
        //                 Save
        //             </Button>
        //         </div>
        //     )
        // }

        case "manual": {
            return (
                <div className="manual-trigger">
                    <h2>
                        <IconButton icon={faArrowLeft} onClick={() => setObj({ type: "" })} />
                        <span>Manual trigger</span>
                    </h2>
                    <div className="settings">
                        <SettingItemText
                            title="Label"
                            placeholder="Enter label"
                            value={obj.label}
                            onChange={label=> setObj(obj=> ({...obj, label}))}
                        />
                    </div>
                    <Button
                        primary
                        className="save"
                        onClick={() => onSubmit(obj)}
                        disabled={!obj.label.length}
                    >
                        Save
                    </Button>
                </div>
            )
        }
            
        default: return <></>
    }
}

export function editTrigger(
    index: number | "new",
    triggers: HMApi.T.Automation.Trigger[],
    setTriggers: React.Dispatch<React.SetStateAction<HMApi.T.Automation.Trigger[]>>
) {
    const id = uniqueId();
    store.dispatch({
        type: "ADD_DIALOG",
        id,
        dialog: {
            children: (({close})=> (
                <EditTrigger
                    trigger={index === "new" ? { type: "" } : triggers[index]}
                    onSubmit={tr => {
                        setTriggers(trs => index === "new" ?
                            [...trs, tr] :
                            [
                                ...trs.slice(0, index),
                                tr,
                                ...trs.slice(index + 1)
                            ]);
                        close();
                    }}
                />
            )),
            cancellable: false,
            title: index === "new" ? "Add Trigger" : "Edit Trigger",
            className: "automation-routine-dialog trigger",
            showCloseButton: true,
        }
    });
    return id;
}

export function TriggerName({ trigger }: { trigger: HMApi.T.Automation.Trigger }) {
    switch (trigger.type) {
        case "deviceEvent":
            return <><RoomAndDeviceName roomId={trigger.room} deviceId={trigger.device} /> <FontAwesomeIcon icon={faChevronRight} /> {trigger.event}</>
        case "roomEvent":
            return <><RoomName roomId={trigger.room} /> <FontAwesomeIcon icon={faChevronRight} /> {trigger.event}</>
        case "globalTrigger":
            return <>{trigger.name}</>
        case "manual":
            return <>Manual: {trigger.label}</>
    }
}
