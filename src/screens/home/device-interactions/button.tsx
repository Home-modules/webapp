import React from "react";
import { HMApi } from "../../../hub/api";
import { IntermittentButton } from "../../../ui/button";
import { DeviceInteractionTypeProps } from "./interactions";

export function DeviceInteractionTypeButton({
    interaction,
    state = { },
    sendAction
}: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type.Button>) {

    return (
        <IntermittentButton
            primary={interaction.primary}
            attention={interaction.attention}
            disabled={interaction.enabled === false}
            onClick={() => sendAction({
                type: "clickButton",
            })}
        >
            {interaction.label}
        </IntermittentButton>
    )
}