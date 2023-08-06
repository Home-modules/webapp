import { HMApi } from "../../../hub/api";
import { handleError, sendRequest } from "../../../hub/request";
import { ContextMenuItem, ContextMenuItemProps } from "../../../ui/context-menu";
import { refreshDeviceStates, refreshFavoriteDeviceStates } from "../room";
import { DeviceInteractionTypeSlider } from "./slider";
import "./interactions.scss";
import { DeviceInteractionTypeButton } from "./button";
import { DeviceInteractionTypeLabel } from "./label";
import { connect } from "react-redux";
import { StoreState } from "../../../store";
import { DeviceInteractionTypeToggleButton } from "./toggleButton";
import { DeviceInteractionTypeTwoButtonNumber } from "./twoButtonNumber";
import { DeviceInteractionTypeUIColorInput } from "./uiColorInput";

export function getSendActionF(deviceState: HMApi.T.DeviceState, interactionId: string, isInFavorites: boolean) {
    return async (action: HMApi.T.DeviceInteraction.Action, refresh = true) => {
        await sendRequest({
            type: "devices.interactions.sendAction",
            roomId: deviceState.roomId,
            deviceId: deviceState.id,
            interactionId: interactionId,
            action
        }).catch(handleError);
        if (refresh) {
            if (isInFavorites) {
                await refreshFavoriteDeviceStates();
            } else {
                await refreshDeviceStates(deviceState.roomId);
            }
        }
    }
}

export type DeviceInteractionsProps = {
    roomId: string, deviceId: string,
    children: (React.ReactElement<ContextMenuItemProps, typeof ContextMenuItem> | null)[],
    isInFavorites: boolean,
    deviceStates: StoreState['deviceStates'],
    favoriteDeviceStates: StoreState['favoriteDeviceStates'],
}

const DeviceInteractions = connect(({ deviceStates, favoriteDeviceStates }: StoreState) => ({ deviceStates, favoriteDeviceStates }))(
    function DeviceInteractions({ deviceStates, favoriteDeviceStates, roomId, deviceId, children, isInFavorites }: DeviceInteractionsProps) {

        const deviceStatesThisRoom = isInFavorites ? (favoriteDeviceStates) : (deviceStates[roomId]);
        if (!deviceStatesThisRoom) return <>{children}</>;
        const deviceState = deviceStatesThisRoom.find(s => s.roomId === roomId && s.id === deviceId);
        if (!deviceState) return <>{children}</>;

        var interactions = Object.entries(deviceState.type.interactions).map(([id, interaction]) => ({ ...interaction, id }));
        if (interactions.length === 0) {
            return <>{children}</>
        }

        return (
            <div className="device-interactions">
                <div className="interactions" onClick={e => e.stopPropagation()}>
                    {interactions.map(interaction => (deviceState.interactions[interaction.id]!.visible !== false) && (
                        <DeviceInteraction
                            key={interaction.id}
                            interaction={interaction}
                            state={deviceState.interactions[interaction.id]!}
                            sendAction={getSendActionF(deviceState, interaction.id, isInFavorites)}
                            startSliderStream={() => ({
                                type: "devices.interactions.initSliderLiveValue",
                                deviceId,
                                roomId,
                                interactionId: interaction.id
                            })}
                        />
                    ))}
                </div>
                <div className="other-controls">
                    {children}
                </div>
            </div>
        )
    });
export default DeviceInteractions;

export type DeviceInteractionTypeProps<T extends HMApi.T.DeviceInteraction.Type> = {
    interaction: T,
    state: HMApi.T.DeviceInteraction.State<T>,
    sendAction: (action: HMApi.T.DeviceInteraction.Action<T>, refresh?: boolean) => Promise<void>,
    isDefault?: boolean
    startSliderStream: () => HMApi.Request.Devices.Interactions.InitSliderLiveValue
};

export function DeviceInteraction({ interaction, state, sendAction, ...props }: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type>) {
    switch (interaction.type) {
        case 'slider':
            return <DeviceInteractionTypeSlider interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.Slider} sendAction={sendAction} {...props} />;
        case 'button':
            return <DeviceInteractionTypeButton interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.Button} sendAction={sendAction} {...props} />;
        case 'label':
            return <DeviceInteractionTypeLabel interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.Label} sendAction={sendAction} {...props} />;
        case 'toggleButton':
            return <DeviceInteractionTypeToggleButton interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.ToggleButton} sendAction={sendAction} {...props} />;
        case 'twoButtonNumber':
            return <DeviceInteractionTypeTwoButtonNumber interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.TwoButtonNumber} sendAction={sendAction} {...props} />;
        case 'uiColorInput':
            return <DeviceInteractionTypeUIColorInput interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.UIColorInput} sendAction={sendAction} {...props} />;
        default:
            return null;
    }
}