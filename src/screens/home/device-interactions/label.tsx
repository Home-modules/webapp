import React from "react";
import { HMApi } from "../../../hub/api";
import { DeviceInteractionTypeProps } from "./interactions";

export function DeviceInteractionTypeLabel({
    interaction,
    state = { text: interaction.defaultValue||'' },
    sendAction
}: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type.Label>) {

    return (
        <div className={`label align-${interaction.align||'start'} ${interaction.color||''} ${interaction.size||"medium"}`}>
            {state.text}
        </div>
    )
}