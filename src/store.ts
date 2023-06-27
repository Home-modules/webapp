import { createStore } from "redux";
import { HMApi } from "./hub/api";
import { defaultAppearanceSettings } from "./screens/settings/appearance/appearance";
import { ContextMenuProps } from "./ui/context-menu";
import { DialogProps } from "./ui/dialogs";
import { FlyoutProps } from "./ui/flyout";
import { NotificationProps } from "./ui/notifications";
import { uniqueId } from "./utils/uniqueId";

const mobileMediaQuery = matchMedia("screen and (max-width: 600px)");

export type StoreState = {
    token: string | null;
    notifications: NotificationProps[];
    dialogs: DialogProps[];
    flyouts: FlyoutProps[];
    contextMenu: ContextMenuProps | null;
    rooms: HMApi.T.Room[] | false | null; // null means loading, false means error
    devices: Record<string, HMApi.T.Device[] | false | undefined>;
    deviceTypes: Record<string, HMApi.T.DeviceType[] | false | undefined>; // undefined means loading, false means error
    roomStates: HMApi.T.RoomState[] | false | undefined;
    deviceStates: Record<string, HMApi.T.DeviceState[] | false | undefined>;
    favoriteDeviceStates: HMApi.T.DeviceState[] | false | undefined;
    plugins: {
        installed: HMApi.T.Plugin[] | false | undefined,
        all: HMApi.T.Plugin[] | false | undefined,
    },
    appearanceSettings: {
        showDesktopModeButton: boolean,
        colorTheme: 'dark'|'light'|'system'
    },
    allowDesktopMode: boolean,
};

export type StoreAction = {
    type: "SET_TOKEN",
    token: string | null
} | {
    type: "ADD_NOTIFICATION",
    id?: string,
    notification: Omit<NotificationProps, "id">
} | {
    type: "REMOVE_NOTIFICATION",
    id: string
} | {
    type: "ADD_DIALOG",
    dialog: Omit<DialogProps, "id">
} | {
    type: "REMOVE_DIALOG",
    id: string
} | {
    type: "ADD_FLYOUT",
    flyout: Omit<FlyoutProps, "id">
} | {
    type: "REMOVE_FLYOUT",
    id: string
} | {
    type: "SET_CONTEXT_MENU",
    contextMenu: ContextMenuProps | null
} | {
    type: "SET_ROOMS",
    rooms: HMApi.T.Room[] | false | null
} | {
    type: "SET_DEVICES",
    roomId: string,
    devices: HMApi.T.Device[] | false | undefined
} | {
    type: "SET_DEVICE_TYPES",
    roomController: string,
    deviceTypes: HMApi.T.DeviceType[] | false | undefined
} | {
    type: "SET_ROOM_STATES",
    states: StoreState['roomStates']
} | {
    type: "SET_ROOM_STATE",
    state: HMApi.T.RoomState
} | {
    type: "SET_DEVICE_STATES",
    roomId: string,
    states: StoreState['deviceStates'][string]
} | {
    type: "SET_DEVICE_STATE",
    state: HMApi.T.DeviceState
} | {
    type: "SET_FAVORITE_DEVICE_STATES",
    states: StoreState['favoriteDeviceStates']
} | {
    type: "SET_PLUGINS",
    list: "all" | "installed",
    plugins: HMApi.T.Plugin[] | false | undefined
} | {
    type: "SET_APPEARANCE_SETTINGS",
    settings: Partial<StoreState['appearanceSettings']>;
} | {
    type: "SET_ALLOW_DESKTOP_MODE",
    allowDesktopMode: boolean
}

export const store= createStore<StoreState, StoreAction, {}, {}>((state= {
    token: localStorage.getItem('home_modules_token') || null,
    notifications: [],
    dialogs: [],
    flyouts: [],
    contextMenu: null,
    rooms: null,
    devices: {},
    deviceTypes: {},
    roomStates: undefined,
    deviceStates: {},
    favoriteDeviceStates: undefined,
    plugins: {
        all: undefined,
        installed: undefined
    },
    appearanceSettings: JSON.parse(localStorage.getItem('home_modules_appearance_settings') || 'null') || defaultAppearanceSettings,
    allowDesktopMode: !mobileMediaQuery.matches
}, action)=> {
    switch(action.type) {
        case 'SET_TOKEN':
            return {
                ...state,
                token: action.token
            };
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        ...action.notification,
                        id: action.id || uniqueId()
                    }
                ]
            };
        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(e=> e.id!==action.id)
            };
        case 'ADD_DIALOG':
            return {
                ...state,
                dialogs: [
                    ...state.dialogs,
                    {
                        ...action.dialog,
                        id: uniqueId()
                    }
                ]
            };
        case 'REMOVE_DIALOG':
            return {
                ...state,
                dialogs: state.dialogs.filter(e=> e.id!==action.id)
            };
        case 'ADD_FLYOUT':
            return {
                ...state,
                flyouts: [
                    ...state.flyouts,
                    {
                        ...action.flyout,
                        id: uniqueId()
                    }
                ]
            };
        case 'REMOVE_FLYOUT':
            return {
                ...state,
                flyouts: state.flyouts.filter(e=> e.id!==action.id)
            };
        case 'SET_CONTEXT_MENU':
            return {
                ...state,
                contextMenu: action.contextMenu
            };
        case 'SET_ROOMS':
            return {
                ...state,
                rooms: action.rooms
            };
        case 'SET_DEVICES':
            return {
                ...state,
                devices: {
                    ...state.devices,
                    [action.roomId]: action.devices
                }
            };
        case 'SET_DEVICE_TYPES':
            return {
                ...state,
                deviceTypes: {
                    ...state.deviceTypes,
                    [action.roomController]: action.deviceTypes
                }
            };
        case 'SET_ROOM_STATES':
            return {
                ...state,
                roomStates: action.states
            };
        case 'SET_ROOM_STATE':
            return state.roomStates ? {
                ...state,
                roomStates: state.roomStates.map(state => state.id === action.state.id ? action.state : state)
            } : state;
        case 'SET_DEVICE_STATES':
            return {
                ...state,
                deviceStates: {
                    ...state.deviceStates,
                    [action.roomId]: action.states
                }
            };
        case 'SET_DEVICE_STATE': {
            const states = state.deviceStates[action.state.roomId];
            return {
                ...state,
                deviceStates: {
                    ...state.deviceStates,
                    [action.state.roomId]: states ? states.map(state => state.id === action.state.id ? action.state : state) : states
                }
            };
        }
        case 'SET_FAVORITE_DEVICE_STATES':
            return {
                ...state,
                favoriteDeviceStates: action.states
            };
        case 'SET_PLUGINS':
            return {
                ...state,
                plugins: {
                    ...state.plugins,
                    [action.list]: action.plugins
                }
            }
        case 'SET_APPEARANCE_SETTINGS': {
            const newSettings = {
                ...state.appearanceSettings,
                ...action.settings
            }
            localStorage.setItem('home_modules_appearance_settings', JSON.stringify(newSettings));
            return {
                ...state,
                appearanceSettings: newSettings
            }
        }
        case 'SET_ALLOW_DESKTOP_MODE': {
            return {
                ...state,
                allowDesktopMode: action.allowDesktopMode
            }
        }
        default:
            return state;
    }
}, (window as any).__REDUX_DEVTOOLS_EXTENSION__?.());

mobileMediaQuery.addEventListener('change', e => {
    store.dispatch({
        'type': "SET_ALLOW_DESKTOP_MODE",
        allowDesktopMode: !e.matches
    });
})
