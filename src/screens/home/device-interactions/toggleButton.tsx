import React from "react";
import { HMApi } from "../../../hub/api";
import ToggleButton from "../../../ui/fields/toggle-button";
import { DeviceInteractionTypeProps } from "./interactions";

export function DeviceInteractionTypeToggleButton({
    interaction,
    state = { on: !!interaction.default },
    sendAction
}: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type.ToggleButton>) {
    return (
        <ToggleButton
            label={interaction.label}
            value={state.on}
            onChange={(newValue) => 
                sendAction({
                    type: "toggleToggleButton",
                    value: newValue
                })
            }
        />
    )
}