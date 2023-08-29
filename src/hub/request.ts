import axios from 'axios';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { HMApi } from './api';
import { store } from '../store';
import platform from "platform";
import { delay } from '../utils/promise-timeout';
import { uniqueId } from '../utils/uniqueId';
import { updateTheme } from '..';

const port = localStorage.getItem("port") || "";
const host = process.env.NODE_ENV === "production" ?
    "" :
    `${window.location.protocol}//${window.location.hostname}${port}`

const ax = axios.create({
    baseURL: `${host}/request`,
    timeout: 20_000
});

const websocketProtocol = { 'http:': 'ws:', 'https:': 'wss:' }[window.location.protocol];
export const ws = new ReconnectingWebSocket(
    process.env.NODE_ENV === "production" ? "/" : `${websocketProtocol}${window.location.hostname}${port}`
);
ws.onerror = (e) => {
    console.error(e);
}
ws.onmessage = e => {
    const message = e.data as string;
    console.log(message);
    if (message === "LOGGED_OUT" || message === "TOKEN_INVALID") {
        dropToken();
    }
    else if (message.startsWith("UPDATE ")) {
        const update = JSON.parse(message.slice(7)) as HMApi.Update;
        switch (update.type) {
            case "rooms.roomStateChanged":
                store.dispatch({
                    type: "SET_ROOM_STATE",
                    state: update.state
                });
                break;

            case "devices.deviceStateChanged":
                store.dispatch({
                    type: "SET_DEVICE_STATE",
                    state: update.state
                })
                break;
            case "setTheme":
                store.dispatch({
                    type: "SET_APPEARANCE_SETTINGS",
                    settings: {
                        colorTheme: update.theme
                    }
                });
                updateTheme();
                break;
        }
    }
}

export function authorizeWebSocket(token: string) {
    if (ws.readyState === ws.CONNECTING) {
        ws.onopen =
            () => ws.send("AUTH " + token);
    } else
        ws.send("AUTH " + token);
}

export type ResponseWithoutError<R extends HMApi.Request> = {
    type: "ok",
    data: HMApi.Response<R>
};

export function handleAnyErrors<T>(promise: Promise<T>) {
    return new Promise<T>(resolve => promise.then(resolve, handleError));
}

export async function sendRequest<R extends HMApi.Request>(req: R): Promise<ResponseWithoutError<R>> {
    console.log('Request: ', req);
    try {
        const token = store.getState().token;
        const e = await ax.post<ResponseWithoutError<R>>('.', req, {
            headers: token ? { token } : undefined
        });
        console.log('Response: ', e.data);
        return e.data;
    } catch (e: any) {
        if (e.response) {
            const err = e.response.data as HMApi.ResponseOrError<R>;
            console.error('Error: ', err);
            if (err.type === 'error' && err.error.message === 'TOKEN_INVALID') {
                dropToken();
            }
            if (err.type === 'error' && err.error.message === 'TOO_MANY_REQUESTS') {
                await delay(1000);
                return await sendRequest(req); // Resend request after 1 second
            }
            throw err;
        } else {
            // eslint-disable-next-line no-throw-literal
            throw {
                type: "error",
                error: {
                    message: "NETWORK_ERROR",
                    data: e
                }
            };
        }
    }
}

function dropToken() {
    store.dispatch({
        type: 'SET_TOKEN',
        token: null
    });
    localStorage.removeItem('home_modules_token');
}

export function loginToHub(username: string, password: string): Promise<HMApi.ResponseOrError<HMApi.Request.Account.Login>> {
    return new Promise((resolve, reject) => {
        sendRequest({
            type: "account.login",
            username,
            password,
            device: platform.description || 'Unknown device',
        }).then(e => {
            if (e.type === 'ok') {
                store.dispatch({
                    type: 'SET_TOKEN',
                    token: e.data.token
                });
                localStorage.setItem('home_modules_token', e.data.token);
                resolve(e);
            }
            else {
                reject(e);
            }
        }).catch(reject)
    })
}

export function logoutFromHub(): Promise<HMApi.ResponseOrError<HMApi.Request.Account.Logout>> {
    return new Promise((resolve, reject) => {
        sendRequest({
            type: "account.logout"
        }).then(e => {
            if (e.type === 'ok') {
                store.dispatch({
                    type: 'SET_TOKEN',
                    token: null
                });
                localStorage.removeItem('home_modules_token');
                resolve(e);
            }
            else {
                reject(e);
            }
        }).catch(reject)
    })
}

type HMApiResponseWithNetworkError<R extends HMApi.Request> = {
    type: "ok",
    data: HMApi.Response<R>
} | {
    type: "error",
    error: HMApi.Error<R> | {
        message: "NETWORK_ERROR",
        data: any
    }
}

export function handleError(e: HMApiResponseWithNetworkError<HMApi.Request>): void {
    let message = '';
    if (e.type === 'error') {
        switch (e.error.message) {
            case 'TOKEN_INVALID':
                return; // Already handled by logging out
            case 'INTERNAL_SERVER_ERROR':
                message = 'The hub encountered an internal error. Please try again later or contact support.';
                break;
            case 'INVALID_PARAMETER':
            case 'INVALID_REQUEST':
            case 'INVALID_REQUEST_JSON':
            case 'INVALID_REQUEST_TYPE':
            case 'MISSING_PARAMETER':
            case 'PARAMETER_OUT_OF_RANGE':
                message = 'The app sent an invalid request. Please contact support.';
                break;
            case 'CUSTOM_PLUGIN_ERROR':
                message = e.error.text;
                break;
            case 'SESSION_TOO_NEW':
                message = 'You must have been logged in for at least 24 hours to perform sensitive actions. Please try again later.';
                break;
            case 'NETWORK_ERROR':
                message = 'The hub could not be reached. Please check if the hub is powered on and is on the same network as this device.';
                break;
            default:
                message = 'An unknown error occurred. Please contact support.';
                break;
        }
    }
    if (message) {
        store.dispatch({
            type: 'ADD_NOTIFICATION',
            notification: {
                type: 'error',
                title: 'Request failed',
                message
            }
        });
    }
}

export function sendRestartingRequest<R extends HMApi.Request>(req: R): Promise<ResponseWithoutError<R>> {
    return sendRequest(req).then(async (res) => {

        const notificationId = uniqueId();
        store.dispatch({
            "type": "ADD_NOTIFICATION",
            id: notificationId,
            notification: {
                timeout: 0, // We'll delete it after reconnection.
                type: 'info',
                hideCloseButton: true,
                message: "The hub is restarting..."
            }
        });

        await delay(500); // Wait for a bit until the hub has shut down
        while (true) { // Now wait until the hub has restarted
            const delayPromise = delay(500); // Start the timer here, but wait for its completion at the end. This way, retries are limited to 2 per second but there will be no wait if the request takes >=500ms.
            try {
                await sendRequest({ type: "empty" });
                // Three possible outcomes:
                // - Respond as normal: Not shut down yet
                // - NETWORK_ERROR: Shut down, not started yet
                // - TOKEN_INVALID: Restart complete
            } catch (e: any) {
                if (e instanceof Error) throw e;
                if (e.type === 'error') {
                    const err = e.error as HMApi.Error<HMApi.Request.Empty>;
                    if (err.message === "TOKEN_INVALID") {
                        break;
                    }
                }
            }
            await delayPromise;
        }

        store.dispatch({
            type: "REMOVE_NOTIFICATION",
            id: notificationId
        });
        store.dispatch({
            "type": "ADD_NOTIFICATION",
            id: notificationId,
            notification: {
                timeout: 2500,
                type: 'success',
                message: "Restarted the hub successfully."
            }
        });

        return res;
    })
}