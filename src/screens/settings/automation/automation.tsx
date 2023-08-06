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
                            <ul className="list">
                                {order.map(id => routines[id]).map(routine => (
                                    <li className="button">
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
                                ))}
                                <Link to="new" className="new">
                                    <FontAwesomeIcon icon={faPlus} />
                                </Link>
                            </ul>
                        )}
                    />
                </PageWithHeader>
                <Outlet />
            </main>
        )
    }
)

export default SettingsPageAutomation;