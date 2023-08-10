import { connect } from "react-redux";
import { PageWithHeader } from "../../../ui/header";
import { StoreState, store } from "../../../store";
import { PlaceHolders } from "../../../ui/placeholders";
import { Link, Navigate, Outlet, useMatch, useSearchParams } from "react-router-dom";
import "./automation.scss";
import ToggleButton from "../../../ui/fields/toggle-button";
import { handleError, sendRequest } from "../../../hub/request";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ReactSortable } from "react-sortablejs";
import { HMApi } from "../../../hub/api";

export function updateRoutines() {
    return sendRequest({
        type: "automation.getRoutines"
    }).then(res => {
        setRoutines(res.data);
    }, err => {
        setRoutines(false);
        handleError(err);
    });

    function setRoutines(routines: StoreState['routines']) {
        store.dispatch({
            type: "SET_ROUTINES",
            routines
        });
    }
}
export function updateRoutinesEnabled() {
    return sendRequest({
        type: "automation.getRoutinesEnabled"
    }).then(res => {
        setRoutines(res.data.enabled);
    }, err => {
        setRoutines(false);
        handleError(err);
    });

    function setRoutines(routines: StoreState['routinesEnabled']) {
        store.dispatch({
            type: "SET_ROUTINES_ENABLED",
            routines
        });
    }
}

const SettingsPageAutomation = connect(
    ({ routines, routinesEnabled }: StoreState) =>
        ({ routines, routinesEnabled })
)(
    function SettingsPageAutomation(
        { routines, routinesEnabled }:
            Pick<StoreState, 'routines' | 'routinesEnabled'>
    ) {


        function onSort() {
            if (routines) {
                sendRequest({
                    type: 'automation.changeRoutineOrder',
                    ids: routines.order
                }).catch(handleError)
            }
        }

        React.useEffect(() => {
            updateRoutines();
            updateRoutinesEnabled();
        }, []);
        const hide = !useMatch({ path: "/settings/automation/", end: true });
        const [searchParams] = useSearchParams();

        if (routines && routinesEnabled && searchParams.has('redirect')) {
            return <Navigate to={searchParams.get('redirect')!} replace />;
        }

        return (
            <main id="automation">
                <PageWithHeader
                    title="Automation"
                    subtitle="Edit routines"
                    className={`routines-list ${hide ? "hidden" : ''}`}
                    //@ts-ignore
                    inert={hide ? "" : undefined}
                >
                    <PlaceHolders
                        content={routines}
                        Wrapper={({ routines, order }) => (
                            <><ReactSortable
                                list={order.map(id=>({id}))}
                                setList={(order) => store.dispatch({
                                    type: 'SET_ROUTINES',
                                    routines: { routines, order: order.map(o=>o.id) }
                                })}
                                onSort={onSort}
                                animation={200}
                                easing='ease'
                                handle='.drag-handle'
                                ghostClass='ghost'
                                className="list"
                                tag="ul"
                            >
                                {order.map(id => routines[id]).map(routine => (
                                    <RoutineItem
                                        key={routine.id}
                                        routine={routine}
                                        routinesEnabled={routinesEnabled}
                                    />
                                ))}
                            </ReactSortable>
                            <Link to="new" className="new">
                                <FontAwesomeIcon icon={faPlus} />
                            </Link></>
                        )}
                    />
                </PageWithHeader>
                <Outlet />
            </main>
        )
    }
)

export default SettingsPageAutomation;

type RoutineItemProps = {
    disableReorder?: boolean,
    routine: HMApi.T.Automation.Routine,
    routinesEnabled?: StoreState['routinesEnabled']
}
function RoutineItem({ disableReorder, routine, routinesEnabled }: RoutineItemProps) {
    return (
        <li className="button">
            {(!disableReorder) && (
                <svg className='drag-handle' width="16" height="16">
                    <path fillRule="evenodd" d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z"></path>
                </svg>
            )}
            <Link to={routine.id.toString()}>
                {routine.name}
            </Link>
            {routinesEnabled && (
                <ToggleButton
                    label=""
                    onChange={async enabled => {
                        await sendRequest({
                            type: "automation.setRoutinesEnabled",
                            routines: [routine.id],
                            enabled
                        });
                        await updateRoutinesEnabled();
                    }}
                    value={routinesEnabled[routine.id]}
                />
            )}
        </li>
    )
}