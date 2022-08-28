import { HMApi } from './api';
import axios from 'axios'
import { store } from '../store';
import platform from "platform";
import { delay } from '../utils/promise-timeout';

const ax = axios.create({
    baseURL: `http://${window.location.hostname}:703`,
    headers: {
        'Content-Type': 'text/plain' // Avoid pre-flight request
    },
    timeout: 20_000
});

export async function sendRequest<R extends HMApi.Request>(req: R): Promise<HMApi.ResponseOrError<R>> {
    console.log('Request: ', req);
    try {
        const e = await ax.post<HMApi.ResponseOrError<R>>(String(store.getState().token), req);
        console.log('Response: ', e.data);
        return e.data;
    } catch(e: any) {
        if(e.response) {
            const err= e.response.data as HMApi.ResponseOrError<R>;
            console.error('Error: ', err);
            if(err.type==='error' && err.error.message==='TOKEN_INVALID') {
                store.dispatch({
                    type: 'SET_TOKEN',
                    token: null
                });
                localStorage.removeItem('home_modules_token');
            }
            if(err.type==='error' && err.error.message==='TOO_MANY_REQUESTS') {
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

export function loginToHub(username: string, password: string): Promise<HMApi.ResponseOrError<HMApi.Request.Login>> {
    return new Promise((resolve, reject)=> {
        sendRequest({
            type: "account.login",
            username,
            password,
            device: platform.description || 'Unknown device',
        }).then(e=> {
            if(e.type==='ok') {
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

export function logoutFromHub(): Promise<HMApi.ResponseOrError<HMApi.Request.Logout>> {
    return new Promise((resolve, reject)=> {
        sendRequest({
            type: "account.logout"
        }).then(e=> {
            if(e.type==='ok') {
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

type HMApiResponseWithNetworkError<R extends HMApi.Request>= {
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
    let message= '';
    if(e.type==='error') {
        switch(e.error.message) {
            case 'TOKEN_INVALID':
                return; // Already handled by logging out
            case 'INTERNAL_SERVER_ERROR':
                message= 'The hub encountered an internal error. Please try again later or contact support.';
                break;
            case 'INVALID_PARAMETER':
            case 'INVALID_REQUEST':
            case 'INVALID_REQUEST_JSON':
            case 'INVALID_REQUEST_TYPE':
            case 'MISSING_PARAMETER':
            case 'PARAMETER_OUT_OF_RANGE':
                message= 'The app sent an invalid request. Please contact support.';
                break;
            case 'CUSTOM_PLUGIN_ERROR':
                message= e.error.text;
                break;
            case 'SESSION_TOO_NEW':
                message= 'You must have been logged in for at least 24 hours to perform sensitive actions. Please try again later.';
                break;
            case 'NETWORK_ERROR':
                message= 'The hub could not be reached. Please check if the hub is powered on and is on the same network as this device.';
                break;
            default:
                message= 'An unknown error occurred. Please contact support.';
                break;
        }
    }
    if(message) {
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