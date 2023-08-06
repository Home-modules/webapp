import React from "react";
import { HMApi } from "../../../hub/api";
import promiseTimeout from "../../../utils/promise-timeout";
import { uniqueId } from "../../../utils/uniqueId";
import { DeviceInteractionTypeProps } from "./interactions";

export function DeviceInteractionTypeUIColorInput({
    interaction: {
        label,
        allowed = ["white", "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown"],
        defaultValue = allowed[0]
    },
    state = { color: defaultValue },
    sendAction,
    isDefault = false
}: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type.UIColorInput>) {
    const [id] = React.useState(uniqueId('color-select-'));
    const [intermittent, setIntermittent] = React.useState(false);

    if (isDefault) {
        label = undefined;
    }

    return (
        <div className="ui-color-input">
            {label && <div className="label">{label}</div>}

            <div className="colors">
                {allowed.map((color, index) => (
                    <input key={index}
                        type='radio'
                        name={id}
                        value={color}
                        checked={color === state.color}
                        onChange={(e) => {
                            if (e.target.checked) {
                                promiseTimeout(sendAction({
                                    type: "setUIColorInputValue",
                                    color
                                }), 100, (promise) => {
                                    setIntermittent(true);
                                    promise.finally(() => setIntermittent(false))
                                });
                            }
                        }}
                        disabled={intermittent}
                    />
                ))}
            </div>
        </div>
    )
}