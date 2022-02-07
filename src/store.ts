import { createStore } from "redux";
import HomePage from "./screens/home";
import { NotificationProps } from "./ui/notifications";
import { uniqueId } from "./uniqueId";

export type StoreState = {
    token: string | null;
    notifications: NotificationProps[];
    CurrentScreen: React.ComponentType<{}>;
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
};

export const store= createStore<StoreState, StoreAction, {}, {}>((state= {
    token: localStorage.getItem('home_modules_token') || null,
    notifications: [],
    CurrentScreen: HomePage
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
        default:
            return state;
    }
})