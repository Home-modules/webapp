import { HMApi } from './api';
import axios from 'axios'
import { store } from '../store';


export function sendRequest<R extends HMApi.Request>(req: R): Promise<HMApi.Response<R>> {
    console.log('Request: ', req);
    return new Promise((resolve, reject) => {
        axios.post<HMApi.Response<R>>(`http://${window.location.hostname}:703/${store.getState().token}`, req, {
            headers: {
                'Content-Type': 'text/plain' // Avoid pre-flight request
            }
        })
            .then(e=> {
                console.log('Response: ', e.data);
                resolve(e.data);
            }).catch(e=> {
                if(e.response) {
                    const err= e.response.data as HMApi.Response<R>;
                    console.error('Error: ', err);
                    if(err.type==='error' && err.error.message==='TOKEN_INVALID') {
                        store.dispatch({
                            type: 'SET_TOKEN',
                            token: null
                        });
                        localStorage.removeItem('home_modules_token');
                    }
                    reject(err);
                } else {
                    reject({
                        type: "error",
                        error: {
                            message: "NETWORK_ERROR",
                            data: e
                        }
                    })
                }
            })
    });
}

export function loginToHub(username: string, password: string): Promise<HMApi.Response<HMApi.RequestLogin>> {
    return new Promise((resolve, reject)=> {
        sendRequest({
            type: "account.login",
            username,
            password
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

export function logoutFromHub(): Promise<HMApi.Response<HMApi.RequestLogout>> {
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
    data: HMApi.ResponseData<R>
} | {
    type: "error",
    error: HMApi.RequestError<R> | {
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
            case 'NETWORK_ERROR':
                message= 'The hub could not be reached. Please check if the hub is powered on and is on the same network as this device.';
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