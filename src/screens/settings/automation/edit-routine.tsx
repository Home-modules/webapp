import { connect } from "react-redux";
import { StoreState, store } from "../../../store";
import { PageWithHeader } from "../../../ui/header";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { HMApi } from "../../../hub/api";
import React from "react";
import "./edit-routine.scss";
import { SettingItemToggle } from "../../../ui/settings/toggle";
import { SettingItemTextSelect } from "../../../ui/settings/text-select";
import ScrollView from "../../../ui/scrollbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { handleError, sendRequest } from "../../../hub/request";
import Button, { IntermittentButton } from "../../../ui/button";
import { ActionName, editAction } from "./action";
import { updateRoutines, updateRoutinesEnabled } from "./automation";
import { TriggerName, editTrigger } from "./trigger";
import ToggleButton from "../../../ui/fields/toggle-button";

const SettingsPageAutomationEditRoutine = connect(
    ({ routines, routinesEnabled }: StoreState) =>
        ({ routines, routinesEnabled })
)(
    function SettingsPageAutomationEditRoutine(
        { routines, routinesEnabled }:
            Pick<StoreState, "routines" | "routinesEnabled">
    ) {

        const id = useParams().routineId;
        if ((!routines) || (!routinesEnabled))
            return <Navigate to={"/settings/automation?redirect=/settings/automation/" + id} />

        let routine: HMApi.T.Automation.Routine;
        if (id === 'new') {
            routine = {
                id: 0,
                name: "",
                actions: [],
                triggers: [],
                actionExecution: "parallel",
                allowTriggerByOtherRoutine: false,
            };
        } else {
            if ((!id) || !(id in routines.routines))
                return <Navigate to={"/settings/automation"} />
            routine = routines.routines[parseInt(id)];
            if (!routine)
                return <Navigate to={"/settings/automation"} />
        }

        return (
            <EditRoutine
                routine={routine}
                routines={routines.routines}
                isNew={id === "new"}
                enabled={id === "new" ? false : routinesEnabled[parseInt(id)]}
            />
        )
    }
)

export default SettingsPageAutomationEditRoutine;


type EditRoutineProps = {
    routine: HMApi.T.Automation.Routine;
    isNew: boolean;
    routines: Record<number, HMApi.T.Automation.Routine>;
    enabled?: boolean
};

function EditRoutine({ routine, isNew, routines, enabled=false }: EditRoutineProps) {

    const [name, setName] = React.useState(routine.name);
    const [actionExecution, setActionExecution] = React.useState(routine.actionExecution);
    const [allowTriggerByOtherRoutine, setAllowTriggerByOtherRoutine] = React.useState(routine.allowTriggerByOtherRoutine);
    const [triggers, setTriggers] = React.useState<HMApi.T.Automation.Trigger[]>(routine.triggers);
    const [actions, setActions] = React.useState<HMApi.T.Automation.Action[]>(routine.actions);
    const [dialogId, setDialogId] = React.useState<string|undefined>()
    const navigate = useNavigate();

    React.useEffect(() => {
        const oldId = dialogId;
        return () => {
            if (oldId) {
                store.dispatch({
                    type: "REMOVE_DIALOG",
                    id: oldId
                });
            }
        }
    }, [dialogId])

    function onSave() {
        const newRoutine: HMApi.T.Automation.Routine = {
            name,
            actionExecution,
            allowTriggerByOtherRoutine,
            triggers,
            actions,
            id: routine.id
        };
        const req: (HMApi.Request.Automation.AddRoutine | HMApi.Request.Automation.EditRoutine) = {
            type: isNew ? "automation.addRoutine" : "automation.editRoutine",
            routine: newRoutine
        }
        return sendRequest(req).then(async r => {
            await updateRoutines();
            if (r.data.id !== undefined) {
                navigate("/settings/automation/" + r.data.id);
            };
            store.dispatch({
                type: "ADD_NOTIFICATION",
                notification: {
                    type: "success",
                    message: r.data.id ? "Routine created" : "Routine saved",
                    timeout: 2000
                },
            });
        }, handleError)
    }

    return (
        <PageWithHeader
            title={isNew ? "New Routine" : "Edit Routine"}
            subtitle={enabled ? "Disable the routine to edit" : undefined}
            backLink=".."
            className="edit-routine"
            buttons={isNew ? [] : [{
                content: (
                    <ToggleButton
                        label=""
                        value={enabled}
                        onChange={async enabled => {
                            await sendRequest({
                                type: "automation.setRoutinesEnabled",
                                routines: [routine.id],
                                enabled
                            });
                            await updateRoutinesEnabled();
                        }}
                    />
                )
            }]}
        >

            <input
                className="routine-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter routine name..."
                autoFocus={isNew}
                disabled={enabled}
            />

            <div className="triggers-actions">
                <div className="triggers">
                    <h2>Triggers</h2>
                    <ScrollView>
                        {triggers.map((trigger, index) => (
                            <Button
                                key={index}
                                onClick={() => setDialogId(editTrigger(index, triggers, setTriggers))}
                                className="trigger"
                                disabled={enabled}
                            >
                                <TriggerName trigger={trigger} />
                            </Button>
                        ))}
                        <button
                            className="new"
                            onClick={() => setDialogId(editTrigger("new", triggers, setTriggers))}
                            disabled={enabled}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </ScrollView>
                    <SettingItemToggle
                        title="Allow trigger by other routines"
                        state={allowTriggerByOtherRoutine}
                        onChange={setAllowTriggerByOtherRoutine}
                        disabled={enabled}
                    />
                </div>
                <div className="actions">
                    <h2>Actions</h2>
                    <ScrollView>
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                onClick={() => setDialogId(editAction(index, actions, setActions))}
                                className="action"
                                disabled={enabled}
                            >
                                <ActionName action={action} routines={routines} />
                            </Button>
                        ))}
                        <button
                            className="new"
                            onClick={() => setDialogId(editAction("new", actions, setActions))}
                            disabled={enabled}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                        {actions.length === 0 && (
                            <div className="notice">The routine must contain at least one action</div>
                        )}
                    </ScrollView>
                    <SettingItemTextSelect
                        title="Execution mode"
                        options={{
                            "sequential": "Sequential",
                            "parallel": "Parallel"
                        }}
                        value={actionExecution}
                        onChange={v => {
                            if (!enabled) setActionExecution(v);
                        }}
                    />
                </div>
            </div>

            <IntermittentButton
                className="save"
                primary
                onClick={onSave}
                disabled={enabled || !(name && actions.length)}
                title={
                    name === "" ?
                    "Enter a name for the routine" :
                    actions.length === 0 ?
                    "Please add at least one action" : ""
                }
            >
                Save
            </IntermittentButton>
        </PageWithHeader>
    );
}