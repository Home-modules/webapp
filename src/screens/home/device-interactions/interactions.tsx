import { HMApi } from "../../../hub/api";
import { sendRequest } from "../../../hub/request";
import { ContextMenuItem, ContextMenuItemProps } from "../../../ui/context-menu";
import { refreshDeviceStates, refreshFavoriteDeviceStates } from "../room";
import { DeviceInteractionTypeSlider } from "./slider";
import "./interactions.scss";
import { DeviceInteractionTypeButton } from "./button";
import { DeviceInteractionTypeLabel } from "./label";
import { connect } from "react-redux";
import { StoreState } from "../../../store";

export type DeviceInteractionsProps = {
    roomId: string, deviceId: string,
    children: (React.ReactElement<ContextMenuItemProps, typeof ContextMenuItem> | null)[],
    isInFavorites: boolean,
    deviceStates: StoreState['deviceStates'],
    favoriteDeviceStates: StoreState['favoriteDeviceStates'],
}

const DeviceInteractions = connect(({ deviceStates, favoriteDeviceStates }: StoreState) => ({ deviceStates, favoriteDeviceStates }))(
    function DeviceInteractions({ deviceStates, favoriteDeviceStates, roomId, deviceId, children, isInFavorites }: DeviceInteractionsProps) {
        const deviceState = isInFavorites ?
            (favoriteDeviceStates as HMApi.T.DeviceState[]).find(s => s.roomId === roomId && s.id === deviceId)! :
            (deviceStates[roomId] as HMApi.T.DeviceState[]).find(s => s.roomId === roomId && s.id === deviceId)!;

        var interactions = Object.entries(deviceState.type.interactions).map(([id, interaction]) => ({ ...interaction, id }));
        if (interactions.length === 0) {
            return <>{children}</>
        }

        return (
            <div className="device-interactions">
                <div className="interactions" onClick={e => e.stopPropagation()}>
                    {interactions.map(interaction => (
                        <DeviceInteraction
                            key={interaction.id}
                            interaction={interaction}
                            state={deviceState.interactions[interaction.id]}
                            sendAction={async (action, refresh = true) => {
                                await sendRequest({
                                    type: "devices.interactions.sendAction",
                                    roomId: deviceState.roomId,
                                    deviceId: deviceState.id,
                                    interactionId: interaction.id,
                                    action
                                });
                                if (refresh) {
                                    if (isInFavorites) {
                                        refreshFavoriteDeviceStates();
                                    } else {
                                        refreshDeviceStates(deviceState.roomId);
                                    }
                                }
                            }}
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
    state?: HMApi.T.DeviceInteraction.State<T>,
    sendAction: (action: HMApi.T.DeviceInteraction.Action<T>, refresh?: boolean) => Promise<void>
}

export function DeviceInteraction({ interaction, state, sendAction }: DeviceInteractionTypeProps<HMApi.T.DeviceInteraction.Type>) {
    switch (interaction.type) {
        case 'slider':
            return <DeviceInteractionTypeSlider interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.Slider} sendAction={sendAction} />;
        case 'button':
            return <DeviceInteractionTypeButton interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.Button} sendAction={sendAction} />;
        case 'label':
            return <DeviceInteractionTypeLabel interaction={interaction} state={state as HMApi.T.DeviceInteraction.State.Label} sendAction={sendAction} />;
        default:
            return null;
    }
}