import { faArrowLeft, faBattery, faDoorOpen, faFan, faLightbulb, faPlug, faSliders, faTemperatureHigh, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, Outlet, useMatch } from "react-router-dom";
import './new.scss';
import './edit-device';

export default function SettingsPageRoomsDevicesNewDevice() {
    let hideList = !useMatch('/settings/rooms/:roomId/devices/new/');

    return (
        <main className="new-device">
            <div className={`choose-type ${hideList ? 'hidden' : ''}`}>
                <h1>
                    <Link to="..">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Link>
                    New device
                </h1>
                <div className="subtitle">
                    Select device type
                </div>
                <div className="device-types">
                    <Link to="light" className="button">
                        <FontAwesomeIcon icon={faLightbulb} />
                        Light
                    </Link>
                    <Link to="outlet" className="button">
                        <FontAwesomeIcon icon={faPlug} />
                        Outlet
                    </Link>
                    <Link to="fan" className="button">
                        <FontAwesomeIcon icon={faFan} />
                        Fan
                    </Link>
                    <Link to="switch" className="button">
                        <FontAwesomeIcon icon={faToggleOff} />
                        Switch
                    </Link>
                    <Link to="dimmer" className="button">
                        <FontAwesomeIcon icon={faSliders} />
                        Dimmer
                    </Link>
                    <Link to="thermostat" className="button">
                        <FontAwesomeIcon icon={faTemperatureHigh} />
                        Thermostat
                    </Link>
                    <Link to="door" className="button">
                        <FontAwesomeIcon icon={faDoorOpen} />
                        Door
                    </Link>
                    <Link to="photo-resistor" className="button">
                        <FontAwesomeIcon icon={faLightbulb} />
                        Photo resistor
                    </Link>
                    <Link to="power-wall" className="button">
                        <FontAwesomeIcon icon={faBattery} />
                        PowerWall
                    </Link>
                </div>
            </div>
            <Outlet />
        </main>
    );
}