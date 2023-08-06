import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { HMApi } from "../../../hub/api";
import promiseTimeout from "../../../utils/promise-timeout";
import { DeviceInteractionTypeProps } from "./interactions";
import "./twoButtonNumber.scss";

export function DeviceInteractionTypeTwoButtonNumber({
    interaction,
    state = { value: interaction.min === undefined ? 0 : interaction.min },
    sendAction,
    isDefault = false
}: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type.TwoButtonNumber>) {
    interaction = { ...interaction }; // Create a copy so we can mutate it safely

    interaction.decreaseButton ||= {
        icon: "Minus"
    }
    interaction.increaseButton ||= {
        icon: "Plus"
    }
    if (interaction.step === undefined) {
        interaction.step = 1;
    }
    if (isDefault) {
        interaction.label = undefined;
    }

    return (
        <div className="two-button-number">
            {interaction.label && <div className="label">
                {interaction.label}
            </div>}
            <div className="content">
                <ChangeButton
                    disabled={state.value <= interaction.min}
                    settings={interaction.decreaseButton}
                    onClick={() =>
                        sendAction({
                            type: "setTwoButtonNumberValue",
                            value: state.value - interaction.step!
                        })
                    }
                />
                <div className="value">
                    {state.value}{interaction.postfix}
                </div>
                <ChangeButton
                    disabled={state.value >= interaction.max}
                    settings={interaction.increaseButton}
                    onClick={() =>
                        sendAction({
                            type: "setTwoButtonNumberValue",
                            value: state.value + interaction.step!
                        })
                    }
                />
            </div>
        </div>
    )
}

export type ChangeButtonProps = {
    disabled?: boolean,
    settings: Exclude<HMApi.T.DeviceInteraction.Type.TwoButtonNumber['decreaseButton'], undefined>,
    onClick(): Promise<void>
}

function ChangeButton({ disabled, settings, onClick }: ChangeButtonProps) {
    const [intermittent, setIntermittent] = React.useState(false);

    return (
        <div className="button-container">
            <button
                className={`button primary ${settings.color || ''} ${intermittent ? 'intermittent-spin' : ''}`}
                onClick={e => {
                    e.stopPropagation();
                    const res = onClick();
                    promiseTimeout(res, 100, () => {
                        setIntermittent(true);
                        res.finally(() => setIntermittent(false))
                    })
                }}
                disabled={disabled || intermittent}
            >
                {'icon' in settings ? (
                    <FontAwesomeIcon icon={fas['fa' + settings.icon]} />
                ) : settings.text}
            </button>
        </div>
    );
}