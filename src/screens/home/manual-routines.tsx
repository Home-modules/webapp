import { connect } from "react-redux";
import { StoreState, store } from "../../store";
import ScrollView from "../../ui/scrollbar";
import { IntermittentButton } from "../../ui/button";
import { handleAnyErrors, handleError, sendRequest } from "../../hub/request";
import { useEffect } from "react";
import "./manual-routines.scss";
import { Header } from "../../ui/header";
import { ContextMenuItem } from "../../ui/context-menu";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { refreshFavoriteDeviceStates } from "./room";

export async function refreshManualRoutines() {
    function set(routines: StoreState['manualRoutines']) {
        store.dispatch({
            type: 'SET_MANUAL_ROUTINES',
            routines
        });
    }

    return sendRequest({
        type: 'automation.getManualTriggerRoutines',
    }).then(res => {
        set(res.data.routines);
    }, err => {
        handleError(err);
        set(false);
    })
}

export const ManualRoutines = connect(({ manualRoutines }: StoreState) => ({ manualRoutines }))(
    function ManualRoutines({ manualRoutines }: Pick<StoreState, "manualRoutines">) {
        useEffect(() => {
            refreshManualRoutines();
        }, []);

        if (manualRoutines && manualRoutines.length) {
            return (
                <div className="manual-routines">
                    <Header title="Routines" tag="h2" />
                    <ScrollView>
                        {manualRoutines.map(({ id, label }) => (
                            <IntermittentButton
                                onClick={async() => {
                                    await handleAnyErrors(sendRequest({
                                        type: "automation.triggerManualRoutine",
                                        routine: id
                                    }));
                                    await refreshFavoriteDeviceStates();
                                }}
                                onContextMenu={e => {
                                    e.preventDefault();
                                    store.dispatch({
                                        type: 'SET_CONTEXT_MENU',
                                        contextMenu: {
                                            x: e.clientX,
                                            y: e.clientY,
                                            children: 
                                                <ContextMenuItem key={1}
                                                    icon={faPen}
                                                    href={`/settings/automation/${id}`}
                                                >
                                                    Edit routine
                                                </ContextMenuItem>
                                        }
                                    })
                                }}
                            >
                                {label}
                            </IntermittentButton>
                        ))}
                    </ScrollView>
                </div>
            )
        } else return <></>
    }
)