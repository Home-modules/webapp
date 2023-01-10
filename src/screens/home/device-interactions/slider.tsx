import React from "react";
import { HMApi } from "../../../hub/api";
import { sendRequest, ws } from "../../../hub/request";
import Slider from "../../../ui/fields/slider";
import { DeviceInteractionTypeProps } from "./interactions";

export function DeviceInteractionTypeSlider({
    interaction,
    state = { value: interaction.min === undefined ? 0 : interaction.min },
    sendAction,
    isDefault = false,
    startSliderStream,
}: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type.Slider>) {
    const [value, setValue] = React.useState(state.value);
    React.useEffect(() => {
        setValue(state.value);
    } , [state.value]);

    // unix timestamp of the last time value was sent
    // -Infinity means never called, Infinity means current call is in progress. 
    // value should only be sent if the last call is finished and older than 6ms.
    const [lastTimeLiveChanged, setLastTimeLiveChanged] = React.useState(-Infinity);
    const [liveValueID, setLiveValueID] = React.useState<number | undefined>(undefined);

    React.useEffect(() => {
        let id: number;
        if (interaction.live) {
            startSliderStream().then(res=> setLiveValueID(id = res.data.id));
        }

        return () => {
            if (id) {
                sendRequest({
                    type: "devices.interactions.endSliderLiveValue",
                    id
                });
            }
        }
    }, [interaction])

    if (isDefault) {
        interaction = { ...interaction, label: undefined };
    }

    return (
        <Slider
            value={value}
            onChange={value => {
                setValue(value);
                if (interaction.live && liveValueID && lastTimeLiveChanged + 6 < Date.now()) {
                    ws.send(`SLIDER_VALUE ${liveValueID} ${value}`);
                    setLastTimeLiveChanged(Date.now());
                }
            }}
            onPointerUp={() => {
                sendAction({
                    type: "setSliderValue",
                    value
                });
            } }
            min={interaction.min}
            max={interaction.max}
            step={interaction.step}
            showValue={interaction.showValue}
            postfix={interaction.postfix}
            label={interaction.label}
            color={interaction.color}
        />
    )
}