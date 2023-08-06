import React from "react";
import { HMApi } from "../../../hub/api";
import { DeviceInteractionTypeProps } from "./interactions";

export function DeviceInteractionTypeLabel({
    interaction,
    state = { text: interaction.defaultValue || '' },
    sendAction,
    isDefault = false
}: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type.Label>) {

    if (isDefault) {
        interaction = {
            ...interaction,
            align: "center",
            size: "medium"
        };
    }

    return (
        <div className={`label align-${interaction.align || 'start'} ${state.color || interaction.color || ''} ${interaction.size || "medium"}`}>
            {state.text}
        </div>
    )
}