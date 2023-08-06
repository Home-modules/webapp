import { Navigate, useSearchParams } from "react-router-dom";
import version from "../version";
import './invalid-version.scss';

export default function InvalidVersionPage() {
    const currentVersion = useSearchParams()[0].get('current');
    if (currentVersion === version) {
        return <Navigate to="/home" />
    }
    return (
        <div id="invalid-version">
            <div>
                Sorry, the versions of the hub and this app do not match. <br />
                The app version is {version}, while the hub version is {currentVersion}. <br />
                {process.env.NODE_ENV === 'production' ? <>
                    If you just updated the hub, resetting the browser cache by pressing <kbd>Ctrl/Cmd</kbd>+<kbd>F5</kbd> might help.
                </> : <>
                    You should only use the commits for the app and hub which were pushed at the same time (&lt; 30min difference) and not followed by another commit in the same hour.
                </>}
            </div>
        </div>
    )
}