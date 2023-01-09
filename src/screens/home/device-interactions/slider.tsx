import React from "react";
import { HMApi } from "../../../hub/api";
import Slider from "../../../ui/fields/slider";
import { DeviceInteractionTypeProps } from "./interactions";

export function DeviceInteractionTypeSlider({
    interaction,
    state = { value: interaction.min === undefined ? 0 : interaction.min },
    sendAction,
    isDefault = false
}: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type.Slider>) {
    const [value, setValue] = React.useState(state.value);
    React.useEffect(() => {
        setValue(state.value);
    } , [state.value]);

    // unix timestamp of the last time setSliderValue was called
    // -Infinity means never called, Infinity means current call is in progress. 
    // setSliderValue should only be called if the last call is finished and older than 120ms.
    const [lastTimeLiveChanged, setLastTimeLiveChanged] = React.useState(-Infinity);

    if (isDefault) {
        interaction = { ...interaction, label: undefined };
    }

    return (
        <Slider
            value={value}
            onChange={value => {
                setValue(value);
                if (interaction.live && lastTimeLiveChanged + 120 < Date.now()) {
                    const timeSent = Date.now();
                    setLastTimeLiveChanged(Infinity);
                    sendAction({
                        type: "setSliderValue",
                        value
                    }, false).then(() => {
                        setLastTimeLiveChanged(timeSent);
                    });
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