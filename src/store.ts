import { createStore } from "redux";
import HomePage from "./screens/home";
import { DialogProps } from "./ui/dialogs";
import { NotificationProps } from "./ui/notifications";
import { uniqueId } from "./uniqueId";

export type StoreState = {
    token: string | null;
    notifications: NotificationProps[];
    CurrentScreen: React.ComponentType<{}>;
    dialogs: DialogProps[];
};

export type StoreAction = {
    type: "SET_TOKEN",
    token: string | null
} | {
    type: "ADD_NOTIFICATION",
    notification: Omit<NotificationProps, "id">
} | {
    type: "REMOVE_NOTIFICATION",
    id: string
} | {
    type: "SET_CURRENT_SCREEN",
    screen: React.ComponentType<{}>
} | {
    type: "ADD_DIALOG",
    dialog: Omit<DialogProps, "id">
} | {
    type: "REMOVE_DIALOG",
    id: string
}

export const store= createStore<StoreState, StoreAction, {}, {}>((state= {
    token: localStorage.getItem('home_modules_token') || null,
    notifications: [],
    CurrentScreen: HomePage,
    dialogs: []
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
                        id: uniqueId()
                    }
                ]
            };
        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(e=> e.id!==action.id)
            };
        case 'SET_CURRENT_SCREEN':
            return {
                ...state,
                CurrentScreen: action.screen
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
        default:
            return state;
    }
})