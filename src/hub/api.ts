import { Paths } from "./api-type-to-path-union.js";

export namespace HMApi {
    /** 
     * Just an empty request, useful as a heartbeat request 
     */
    export type RequestEmpty = {
        type: "empty"
    };

    /** 
     * Gets the hub software version. 
     */
    export type RequestGetVersion = {
        type: "getVersion"
    };

    /** 
     * Logs in to a hub account. 
     * A token is returned which must be passed to all future requests. 
     * (this is the only request that doesn't require an auth token, you can pass any value for it) 
     * @throws `LOGIN_USER_NOT_FOUND` if the user doesn't exist
     * @throws `LOGIN_PASSWORD_INCORRECT` if the password is incorrect
     */
    export type RequestLogin = {
        type: "account.login",
        /** The username. If it doesn't exist, the error LOGIN_USER_NOT_FOUND will be returned. */
        username: string,
        /** The password. If it is incorrect, the error LOGIN_PASSWORD_INCORRECT will be returned with a 1 second delay. */
        password: string
    };

    /** 
     * Logs out from the hub account. 
     * App state should be updated to show the login screen. 
     */
    export type RequestLogout = {
        type: "account.logout"
    };

    /** 
     * Terminates all sessions for this account except the one from which the request was made. 
     */
    export type RequestLogoutOtherSessions = {
        type: "account.logoutOtherSessions"
    };

    /** 
     * Counts the number of sessions for this account, including this one. 
     */
    export type RequestGetSessionsCount = {
        type: "account.getSessionsCount"
    }

    /** 
     * Changes the password of the current account. 
     * @throws LOGIN_PASSWORD_INCORRECT if the current password is incorrect.
     */
    export type RequestChangePassword = {
        type: "account.changePassword",
        /** The password currently in use in the account. If wrong, the error LOGIN_PASSWORD_INCORRECT will be returned with a 1 second delay. */
        oldPassword: string,
        /** The new password to be set. The app must have a second 'confirm password' field. An error will NOT be returned if new password is the same as the current password. */
        newPassword: string
    }

    /** 
     * Changes the username of the current account. 
     * A new token will be returned for future requests and the previous one will be invalidated. 
     * WARNING: This causes all other sessions to be logged out, because there is no way the new token can be sent to other sessions. 
     * @throws USERNAME_ALREADY_TAKEN if the username is already taken.
     * @throws USERNAME_TOO_SHORT if the username is shorter than 3 characters.
     */
    export type RequestChangeUsername = {
        type: "account.changeUsername",
        /** The new username. 
         * Should not be already taken or else the error USERNAME_ALREADY_TAKEN will be returned. 
         * Use `account.checkUsernameAvailable` to check if a username is available or taken.
         * Should be 3 or more characters, or else the error USERNAME_TOO_SHORT will be returned. */
        username: string
    }
    
    /** 
     * Checks if a username is available or already taken. 
     * Useful for changing username. 
     * Note: This does NOT check for too short usernames. You must check yourself. 
     */
    export type RequestCheckUsernameAvailable = {
        type: "account.checkUsernameAvailable",
        /** The username to check. */
        username: string
    }

    /** 
     * Gets the registered rooms in the house 
     */
    export type RequestGetRooms = {
        type: "rooms.getRooms",
    }

    /**
     * Edits the properties of a room.
     * All properties except ID can be changed.
     * If the property `controllerType` is changed, the room will be restarted. (all devices will be turned off, the connection to the controller will be dropped and the room will be initialized again)
     * @throws `NOT_FOUND` with `object="room"` if the room doesn't exist
     */
    export type RequestEditRoom = {
        type: "rooms.editRoom",
        /** The modified room. The room to edit will be determined from the `id` property. */
        room: Room
    }

    /**
     * Adds a new room to the house.
     */
    export type RequestAddRoom = {
        type: "rooms.addRoom",
        /** The new room to add. */
        room: Room
    }

    /**
     * Shuts down and removes a room from the house.
     * @throws `NOT_FOUND` with `object="room"` if the room doesn't exist
     */
    export type RequestRemoveRoom = {
        type: "rooms.removeRoom",
        /** Room ID */
        id: string
    }

    /**
     * Changes the order of the rooms. The new ids must not have any new or deleted room IDs.
     * @throws `ROOMS_NOT_EQUAL` if the passed IDs have new or deleted room IDs.
     */
    export type RequestChangeRoomOrder = {
        type: "rooms.changeRoomOrder",
        /** The new order of the rooms. */
        ids: string[]
    }


    /**
     * Gets the available room controller types.
     */
    export type RequestGetRoomControllerTypes = {
        type: "rooms.controllers.getRoomControllerTypes"
    }

    /**
     * Gets the items of a lazy-loading dropdown. (for room controller and device options)
     * @throws `NOT_FOUND` with `object="controller"` if the controller doesn't exist
     * @throws `NOT_FOUND` with `object="deviceType"` if the device type doesn't exist
     * @throws `NOT_FOUND` with `object="field"` if the field doesn't exist
     * @throws `FIELD_NOT_LAZY_SELECT` if the field is not a lazy-loading dropdown
     */
    export type RequestGetSelectFieldLazyLoadItems = {
        type: "plugins.fields.getSelectLazyLoadItems",
        /** Whether the field is for a room controller or a device */
        for: "roomController",
        /** Room controller type */
        controller: string,
        /** Field name */
        field: string
    } | {
        type: "plugins.fields.getSelectLazyLoadItems",
        /** Whether the field is for a room controller or a device */
        for: "device",
        /** The controller type of the room in which the device is */
        controller: string,
        /** Device type */
        deviceType: string,
        /** Field name */
        field: string
    }

    /**
     * Gets the devices in a room.
     * @throws `NOT_FOUND` with `object="room"` if the room doesn't exist
     */
    export type RequestGetDevices = {
        type: "devices.getDevices",
        /** Room ID */
        roomId: string
    }

    /**
     * Gets the device types for the given room controller type.
     * @throws `NOT_FOUND` with `object="controller"` if the room controller doesn't exist
     */
    export type RequestGetDeviceTypes = {
        type: "devices.getDeviceTypes",
        /** Room controller type */
        controllerType: string
    }

    /**
     * Adds a new device to a room.
     * @throws `DEVICE_ALREADY_EXISTS` if a device with the same ID already exists
     * @throws `NOT_FOUND` with `object="room"` if the room (to which the device is to be added) doesn't exist
     */
    export type RequestAddDevice = {
        type: "devices.addDevice",
        /** Room ID */
        roomId: string,
        /** The new device to add. */
        device: Device
    }

    /**
     * Edits the properties of a device.
     * All properties except ID can be changed.
     * @throws `NOT_FOUND` with `object="device"` if the device doesn't exist
     * @throws `NOT_FOUND` with `object="room"` if the room (which contains the device) doesn't exist
     */
    export type RequestEditDevice = {
        type: "devices.editDevice",
        /** Room ID */
        roomId: string,
        /** The modified device. The device to edit will be determined from the `id` property. */
        device: Device
    }

    /**
     * Removes a device from a room.
     * @throws `NOT_FOUND` with `object="device"` if the device doesn't exist
     * @throws `NOT_FOUND` with `object="room"` if the room (which contains the device) doesn't exist
     */
    export type RequestRemoveDevice = {
        type: "devices.removeDevice",
        /** Room ID */
        roomId: string,
        /** Device ID */
        id: string
    }

    export type Request= RequestEmpty | RequestGetVersion | RequestLogin | RequestLogout | RequestLogoutOtherSessions | RequestGetSessionsCount | RequestChangePassword | RequestChangeUsername | RequestCheckUsernameAvailable | RequestGetRooms | RequestEditRoom | RequestAddRoom | RequestRemoveRoom | RequestChangeRoomOrder | RequestGetRoomControllerTypes | RequestGetSelectFieldLazyLoadItems | RequestGetDevices | RequestGetDeviceTypes | RequestAddDevice | RequestEditDevice | RequestRemoveDevice;


    /** Nothing is returned */
    export type ResponseEmpty = Record<string, never>;

    export type ResponseGetVersion = {
        /** The hub software version */
        version: `${number}.${number}.${number}`
    };

    export type ResponseLogin = {
        /** A token to be used in future requests. */
        token: string
    };

    export type ResponseSessionCount = {
        /** The number of active sessions / terminated sessions */
        sessions: number
    };

    export type ResponseCheckUsernameAvailable = {
        /** False if the username is already taken, true otherwise. */
        available: boolean
    };

    export type ResponseGetRooms = {
        /** The rooms in the house */
        rooms: {[roomId: string]: Room}
    }

    export type ResponseGetRoomControllerTypes = {
        /** The available room controller types */
        types: RoomControllerType[]
    }

    export type ResponseSelectFieldItems = {
        /** The items of the dropdown */
        items: (SettingsFieldSelectOption | SettingsFieldSelectOptionGroup)[]
    }

    export type ResponseGetDevices = {
        /** The devices in the room */
        devices: Record<string, Device>
    }

    export type ResponseGetDeviceTypes = {
        /** The available device types for this room controller type */
        types: DeviceType[]
    }

    export type ResponseData<R extends Request> = 
        R extends RequestEmpty ? ResponseEmpty :
        R extends RequestGetVersion ? ResponseGetVersion :
        R extends RequestLogin ? ResponseLogin :
        R extends RequestLogout ? ResponseEmpty :
        R extends RequestLogoutOtherSessions ? ResponseSessionCount :
        R extends RequestGetSessionsCount ? ResponseSessionCount :
        R extends RequestChangePassword ? ResponseEmpty :
        R extends RequestChangeUsername ? ResponseLogin :
        R extends RequestCheckUsernameAvailable ? ResponseCheckUsernameAvailable :
        R extends RequestGetRooms ? ResponseGetRooms :
        R extends RequestEditRoom ? ResponseEmpty :
        R extends RequestAddRoom ? ResponseEmpty :
        R extends RequestRemoveRoom ? ResponseEmpty :
        R extends RequestChangeRoomOrder ? ResponseEmpty :
        R extends RequestGetRoomControllerTypes ? ResponseGetRoomControllerTypes :
        R extends RequestGetSelectFieldLazyLoadItems ? ResponseSelectFieldItems :
        R extends RequestGetDevices ? ResponseGetDevices :
        R extends RequestGetDeviceTypes ? ResponseGetDeviceTypes :
        R extends RequestAddDevice ? ResponseEmpty :
        R extends RequestEditDevice ? ResponseEmpty :
        R extends RequestRemoveDevice ? ResponseEmpty :
        never;


    /**
     * Auth token isn't valid or expired
     */
    export type RequestErrorTokenInvalid = {
        code: 401,
        message: "TOKEN_INVALID"
    };

    /**
     * The HTTP request is invalid: Wrong method, invalid URL, etc.
     */
    export type RequestErrorInvalidRequest = {
        code: 400,
        message: "INVALID_REQUEST"
    }

    /**
     * Request has malformed JSON
     */
    export type RequestErrorInvalidJSON = {
        code: 400,
        message: "INVALID_REQUEST_JSON"
    };

    /**
     * Request type is missing or invalid
     */
    export type RequestErrorInvalidRequestType = {
        code: 400,
        message: "INVALID_REQUEST_TYPE"
    };

    /**
     * Request is missing a required field
     */
    export type RequestErrorMissingParameter<R extends Request> = {
        code: 400,
        message: "MISSING_PARAMETER"
        missingParameters: Paths<R>[];
    };

    /**
     * Request has an invalid value for a field
     */
    export type RequestErrorInvalidParameter<R extends Request> = {
        code: 400,
        message: "INVALID_PARAMETER"
        paramName: Paths<R>;
    };

    /**
     * A number parameter is out of range, a string or array is too long or too short
     */
    export type RequestErrorParameterOutOfRange<R extends Request> = {
        code: 400,
        message: "PARAMETER_OUT_OF_RANGE"
        paramName: Paths<R>;
    };

    /**
     * An internal server error has occurred
     */
    export type RequestErrorInternalServerError = {
        code: 500,
        message: "INTERNAL_SERVER_ERROR"
    };

    /**
     * The requested item/resource was not found.
     */
    export type RequestErrorNotFound<O extends string> = {
        code: 404,
        message: "NOT_FOUND",
        object: O
    };

    /**
     * The user trying to be logged in to doesn't exists.
     */
    export type RequestErrorLoginUserNotFound = {
        code: 401,
        message: "LOGIN_USER_NOT_FOUND"
    };

    /**
     * The entered password was incorrect. This error has 1 second of delay to prevent brute force attacks.
     */
    export type RequestErrorLoginPasswordIncorrect = {
        code: 401,
        message: "LOGIN_PASSWORD_INCORRECT"
    };

    /**
     * Another account already has this username.
     */
    export type RequestErrorUsernameAlreadyTaken = {
        code: 400,
        message: "USERNAME_ALREADY_TAKEN"
    };

    /**
     * The username is too short. (i.e. less than 3 characters)
     */
    export type RequestErrorUsernameTooShort = {
        code: 400,
        message: "USERNAME_TOO_SHORT"
    };

    /**
     * A room with the same ID already exists.
     */
    export type RequestErrorRoomAlreadyExists = {
        code: 400,
        message: "ROOM_ALREADY_EXISTS"
    };

    /**
     * The passed room IDs have new or deleted room IDs.
     */
    export type RequestErrorRoomsNotEqual = {
        code: 400,
        message: "ROOMS_NOT_EQUAL"
    };

    /**
     * The settings field is not a lazy-loading dropdown.
     */
    export type RequestErrorFieldNotLazySelect = {
        code: 400,
        message: "FIELD_NOT_LAZY_SELECT"
    }

    /**
     * The plugin returned an error for the request
     */
    export type RequestErrorPluginCustomError = {
        code: 400,
        message: "CUSTOM_PLUGIN_ERROR",
        text: string
    }

    /**
     * The device with the same ID already exists.
     */
    export type RequestErrorDeviceAlreadyExists = {
        code: 400,
        message: "DEVICE_ALREADY_EXISTS"
    }

    export type RequestError<R extends Request> = (
        R extends RequestEmpty ? never :
        R extends RequestGetVersion ? never :
        R extends RequestLogin ? RequestErrorLoginPasswordIncorrect | RequestErrorLoginUserNotFound :
        R extends RequestLogout ? never :
        R extends RequestLogoutOtherSessions ? never :
        R extends RequestGetSessionsCount ? never :
        R extends RequestChangePassword ? RequestErrorLoginPasswordIncorrect :
        R extends RequestChangeUsername ? RequestErrorUsernameAlreadyTaken | RequestErrorUsernameTooShort :
        R extends RequestCheckUsernameAvailable ? never :
        R extends RequestGetRooms ? never :
        R extends RequestEditRoom ? RequestErrorNotFound<"room"> | RequestErrorPluginCustomError :
        R extends RequestAddRoom ? RequestErrorRoomAlreadyExists | RequestErrorPluginCustomError :
        R extends RequestRemoveRoom ? RequestErrorNotFound<"room"> :
        R extends RequestChangeRoomOrder ? RequestErrorRoomsNotEqual :
        R extends RequestGetRoomControllerTypes ? never :
        R extends RequestGetSelectFieldLazyLoadItems ? RequestErrorNotFound<"controller"|"deviceType"|"field"> | RequestErrorFieldNotLazySelect | RequestErrorPluginCustomError :
        R extends RequestGetDevices ? RequestErrorNotFound<"room"> :
        R extends RequestGetDeviceTypes ? RequestErrorNotFound<"controller"> :
        R extends RequestAddDevice ? RequestErrorDeviceAlreadyExists | RequestErrorNotFound<"room"> | RequestErrorPluginCustomError :
        R extends RequestEditDevice ? RequestErrorNotFound<"device"|"room"> | RequestErrorPluginCustomError :
        R extends RequestRemoveDevice ? RequestErrorNotFound<"device"|"room"> :
        never
    ) | (
        [R extends R ? keyof Omit<R, 'type'>: never ][0] extends never ? never : (RequestErrorMissingParameter<R> | RequestErrorInvalidParameter<R> | RequestErrorParameterOutOfRange<R>)
    ) | 
        RequestErrorInvalidRequest |
        RequestErrorInvalidJSON |
        RequestErrorInvalidRequestType |
        RequestErrorInternalServerError | (
        R extends RequestLogin ? never : RequestErrorTokenInvalid
    );


    export type Response<R extends Request> = {
        type: "ok",
        data: ResponseData<R>
    } | {
        type: "error",
        error: RequestError<R>
    };


    /**
     * Describes a room.
     */
    export type Room = {
        /** The room's ID, usually a more machine-friendly version of `name` */
        id: string,
        /** The room's name, e.g. "Living Room" */
        name: string,
        /** The icon to show for the room */
        icon: "living-room" | "kitchen" | "bedroom" | "bathroom" | "other",
        /** Room controller type and mode */
        controllerType: RoomController,
    }

    /**
     * A room controller type definition
     */
    export type RoomControllerType = {
        /** The room controller id */
        id: `${string}:${string}`,
        /** The room controller name */
        name: string,
        /** The room controller sub-name (aka mode) */
        sub_name: string
        /** Settings fields */
        settings: SettingsField[]
    }

    /**
     * A room controller type and mode along with its configuration
     */
    export type RoomController = {
        /** The room controller type and mode (id of its type) */
        type: string,
        /** Settings for the controller */
        settings: Record<string, string|number|boolean>
    }
    
    /**
     * A device type information
     */
    export type DeviceType = {
        /** The device type id */
        id: `${string}:${string}`,
        /** The device name */
        name: string,
        /** The device sub-name (aka mode) */
        sub_name: string,
        /** Settings fields */
        settings: SettingsField[],
        /** The icon to show for the device */
        icon: IconName
    };

    /**
     * A device in a room. Does not contain info about the device state or which room it is in.
     */
    export type Device = {
        /** The device ID */
        id: string,
        /** The device name */
        name: string,
        /** The device type */
        type: string,
        /** The device parameters */
        params: {
            [key: string]: string|number|boolean,
        },
    }

    /**
     * Properties shared by most of SettingsField* types
     */
    type SettingsFieldGeneralProps<T>= {
        /** Field ID */
        id: string,
        /** Field label */
        label: string,
        /** Field description */
        description?: string,
        /** The default value for the field */
        default?: T,
        /** True if the field is required */
        required?: boolean,
    }

    /**
     * A text input.
     */
    export type SettingsFieldText = SettingsFieldGeneralProps<string> & {
        type: 'text',
        /** Field placeholder */
        placeholder?: string,
        /** Minimum number of characters in the field. */
        min_length?: number,
        /** Maximum number of characters in the field. */
        max_length?: number,
        /** Error message to show when the value is too short. */
        min_length_error?: string,
        /** Error message to show when the value is too long. */
        max_length_error?: string,
        /** A text to show after the value (e.g. unit of measurement) */
        postfix?: string,
    }

    /**
     * A numerical input.
     */
    export type SettingsFieldNumber = SettingsFieldGeneralProps<number> & {
        type: 'number',
        /** Field placeholder */
        placeholder?: string,
        /** Minimum value */
        min?: number,
        /** Maximum value */
        max?: number,
        /** Error message to show when the value is too small. */
        min_error?: string,
        /** Error message to show when the value is too large. */
        max_error?: string,
        /** A text to show after the value (e.g. unit of measurement) */
        postfix?: string,
        /** Whether to show the arrows/spinners and allow scrolling and using up and down arrow buttons to change value. Enabled by default */
        scrollable?: boolean,
    }

    /**
     * A check-box. Required check-boxes must be checked.
     */
    export type SettingsFieldCheckbox = SettingsFieldGeneralProps<boolean> & {
        type: 'checkbox',
        /** If provided, the description will change to this value when the field is checked. */
        description_on_true?: string
    }

    /**
     * A radio-button group
     */
    export type SettingsFieldRadio = Omit<SettingsFieldGeneralProps<string>, 'label'> & {
        type: 'radio',
        /** THe list of radio buttons */
        options: Record<string, {
            /** Option label */
            label: string,
            /** Option description. Not recommended if the radio group has a label and/or description. Ignored if direction is horizontal */
            description?: string,
        }>,
        /** The preferred orientation of the radio buttons. 'h' means they will be on the same line and 'v' means they will be on different lines. */
        direction: 'h'|'v',
        /** Label before the radio buttons */
        label?: string
    }

    /**
     * A drop-down / select / combo-box
     */
    export type SettingsFieldSelect = SettingsFieldGeneralProps<string> & {
        type: 'select',
        /** The list of options */
        options: (SettingsFieldSelectOption|SettingsFieldSelectOptionGroup)[] | SettingsFieldSelectLazyOptions,
        /** Whether the user can fill in the value instead of selecting an item. The field will show the value of the active option instead of its label+subtext. */
        allowCustomValue?: boolean,
        /** Whether the custom value should be checked to be in the items. Ignored if allowCustomValue is false or the options are lazy-loading. */
        checkCustomValue?: boolean,
        /** A search bar will be shown in the dropdown if true. A number can instead be provided which will be the minimum number of total options for the search bar to be shown. */
        showSearchBar?: boolean | number,
    }

    /**
     * An option in a drop-down / select / combo-box
     */
    export type SettingsFieldSelectOption = {
        isGroup?: false,
        /** The value of the dropdown when this option is selected */
        value: string,
        /** Option label */
        label: string,
        /** Smaller/lighter text to be shown alongside the label. Might be shown in parentheses if proper rendering isn't possible. */
        subtext?: string,
    }

    /**
     * A group of options in a drop-down / select / combo-box
     */
    export type SettingsFieldSelectOptionGroup = {
        isGroup: true,
        /** Group label */
        label: string,
        /** Smaller/lighter text to be shown alongside the label. Might be shown in parentheses if proper rendering isn't possible. */
        subtext?: string,
        /** Whether to expand or collapse the group when the dropdown is shown. Might be ignored if not supported. */
        expanded?: boolean,
        /** The list of options in the group */
        children: SettingsFieldSelectOption[],
    }

    /**
     * The options for a lazy-loading drop-down / select / combo-box
     */
    export type SettingsFieldSelectLazyOptions = {
        isLazy: true;
        /** The fallback texts to use instead of the default ones */
        fallbackTexts?: {
            /** The text to show when the list is loading */
            whenLoading?: string;
            /** The text to show when the list is empty */
            whenEmpty?: string;
            /** The text to show if the list cannot be loaded (request failure) */
            whenError?: string;
        }
        /** 
         * When to load the items: 
         * - When the field is rendered
         * - When the dropdown is opened (Warning: dropdown button will show the value of the active item instead of its label+subtext before the list is loaded, so it is recommended to only use this mode when values == labels.)
         */
        loadOn: 'render'|'open',
        /** Whether to refresh every time the dropdown is opened (default is true) */
        refreshOnOpen?: boolean,
        /** 
         * Whether to show a manual refresh button in the dropdown. The button is always hidden while loading the list. (default is false)
         * Can be a(n):
         * - boolean: true to show the button (controls all states)
         * - object: Control each state and set a custom text
         * - array (2 items): First item (boolean) controls the visibility, second item (string) controls the button text
         */
        showRefreshButton?: boolean | {
            /** Whether to show the button when the list is loaded and not empty */
            whenNormal?: boolean,
            /** Whether to show the button when the list is empty */
            whenEmpty?: boolean,
            /** Whether to show the button when the list cannot be loaded */
            whenError?: boolean,
            /** Whether to show the button when loading the list. The button will be disabled in this state and only shown to prevent UI flashes. */
            whenLoading?: boolean,
            /** Refresh button text (default: "Refresh" (normal, empty) or "Refreshing" (loading) or "Retry" (error)) */
            buttonText?: string | {
                /** Default: "Refresh" */
                whenNormal?: string,
                /** Default: "Refresh" */
                whenEmpty?: string,
                /** Default: "Retry" */
                whenError?: string,
                /** Default: "Refresh" */
                whenLoading?: string,
            },
        } | [boolean, string | {
            /** Default: "Refresh" */
            whenNormal?: string,
            /** Default: "Refresh" */
            whenEmpty?: string,
            /** Default: "Retry" */
            whenError?: string,
            /** Default: "Refresh" */
            whenLoading?: string,
        }],
    };

    /**
     * A slider / range / track-bar
     */
    export type SettingsFieldSlider = SettingsFieldGeneralProps<number> & {
        type: 'slider',
        /** The minimum value */
        min?: number,
        /** The maximum value */
        max?: number,
        /** The step size */
        step?: number,
        /** The slider color (useful for color fields) */
        color?: 'white'|'black'|'blue'|'green'|'red'|'yellow',
        /** Slider appearance (horizontal/vertical/radial) */
        appearance?: 'horizontal'|'vertical'|'radial',
    }

    /**
     * A horizontal wrapper that contains several columns of fields
     */
    export type SettingsFieldHorizontalWrapper = {
        type: 'horizontal_wrapper',
        /** The columns */
        columns: SettingsFieldHorizontalWrapperColumn[],
    }

    /**
     * A column in a horizontal wrapper
     */
    export type SettingsFieldHorizontalWrapperColumn = {
        /** The fields in the column */
        fields: SettingsField[],
        /** 
         * The width of the column. 
         * The total width of all columns is mapped to the wrapper's width. 
         * If not specified, the width will be automatically determined by the content. 
         * You can set the width to 1 while the other columns have auto width to fill the remaining space.
         */
        width?: number,
    }

    /**
     * A group of fields with a border and legend
     */
    export type SettingsFieldContainer = {
        type: 'container',
        /** Container label (aka 'legend') */
        label: string,
        /** The list of fields */
        children: SettingsField[],
    }

    /** A Font Awesome v6 free solid icon name */
    /** cSpell:disable */
    export type IconName = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'A'|'Ad'|'Add'|'AddressBook'|'AddressCard'|'Adjust'|'AirFreshener'|'AlignCenter'|'AlignJustify'|'AlignLeft'|'AlignRight'|'Allergies'|'Ambulance'|'AmericanSignLanguageInterpreting'|'Anchor'|'AngleDoubleDown'|'AngleDoubleLeft'|'AngleDoubleRight'|'AngleDoubleUp'|'AngleDown'|'AngleLeft'|'AngleRight'|'AnglesDown'|'AnglesLeft'|'AnglesRight'|'AnglesUp'|'AngleUp'|'Angry'|'Ankh'|'AppleAlt'|'AppleWhole'|'Archive'|'Archway'|'AreaChart'|'ArrowAltCircleDown'|'ArrowAltCircleLeft'|'ArrowAltCircleRight'|'ArrowAltCircleUp'|'ArrowCircleDown'|'ArrowCircleLeft'|'ArrowCircleRight'|'ArrowCircleUp'|'ArrowDown'|'ArrowDown19'|'ArrowDown91'|'ArrowDownAZ'|'ArrowDownLong'|'ArrowDownShortWide'|'ArrowDownWideShort'|'ArrowDownZA'|'ArrowLeft'|'ArrowLeftLong'|'ArrowLeftRotate'|'ArrowPointer'|'ArrowRight'|'ArrowRightArrowLeft'|'ArrowRightFromBracket'|'ArrowRightFromFile'|'ArrowRightLong'|'ArrowRightRotate'|'ArrowRightToBracket'|'ArrowRightToFile'|'ArrowRotateBack'|'ArrowRotateBackward'|'ArrowRotateForward'|'ArrowRotateLeft'|'ArrowRotateRight'|'Arrows'|'ArrowsAlt'|'ArrowsAltH'|'ArrowsAltV'|'ArrowsH'|'ArrowsLeftRight'|'ArrowsRotate'|'ArrowsUpDown'|'ArrowsUpDownLeftRight'|'ArrowsV'|'ArrowTrendDown'|'ArrowTrendUp'|'ArrowTurnDown'|'ArrowTurnRight'|'ArrowTurnUp'|'ArrowUp'|'ArrowUp19'|'ArrowUp91'|'ArrowUpAZ'|'ArrowUpFromBracket'|'ArrowUpLong'|'ArrowUpRightFromSquare'|'ArrowUpShortWide'|'ArrowUpWideShort'|'ArrowUpZA'|'AslInterpreting'|'AssistiveListeningSystems'|'Asterisk'|'At'|'Atlas'|'Atom'|'AudioDescription'|'AustralSign'|'Automobile'|'Award'|'B'|'Baby'|'BabyCarriage'|'Backspace'|'Backward'|'BackwardFast'|'BackwardStep'|'Bacon'|'Bacteria'|'Bacterium'|'BagShopping'|'Bahai'|'BahtSign'|'BalanceScale'|'BalanceScaleLeft'|'BalanceScaleRight'|'Ban'|'Bandage'|'BandAid'|'Bank'|'BanSmoking'|'BarChart'|'Barcode'|'Bars'|'BarsProgress'|'BarsStaggered'|'Baseball'|'BaseballBall'|'BaseballBatBall'|'Basketball'|'BasketballBall'|'BasketShopping'|'Bath'|'Bathtub'|'Battery'|'Battery0'|'Battery2'|'Battery3'|'Battery4'|'Battery5'|'BatteryCar'|'BatteryEmpty'|'BatteryFull'|'BatteryHalf'|'BatteryQuarter'|'BatteryThreeQuarters'|'Bed'|'BedPulse'|'Beer'|'BeerMugEmpty'|'Bell'|'BellConcierge'|'BellSlash'|'BezierCurve'|'Bible'|'Bicycle'|'Biking'|'Binoculars'|'Biohazard'|'BirthdayCake'|'BitcoinSign'|'Blackboard'|'Blender'|'BlenderPhone'|'Blind'|'Blog'|'Bold'|'Bolt'|'BoltLightning'|'Bomb'|'Bone'|'Bong'|'Book'|'BookAtlas'|'BookBible'|'BookDead'|'BookJournalWhills'|'Bookmark'|'BookMedical'|'BookOpen'|'BookOpenReader'|'BookQuran'|'BookReader'|'BookSkull'|'BorderAll'|'BorderNone'|'BorderStyle'|'BorderTopLeft'|'BowlingBall'|'Box'|'BoxArchive'|'Boxes'|'BoxesAlt'|'BoxesStacked'|'BoxOpen'|'BoxTissue'|'Braille'|'Brain'|'BrazilianRealSign'|'BreadSlice'|'Briefcase'|'BriefcaseClock'|'BriefcaseMedical'|'BroadcastTower'|'Broom'|'BroomBall'|'Brush'|'Bug'|'BugSlash'|'Building'|'BuildingColumns'|'Bullhorn'|'Bullseye'|'Burger'|'Burn'|'Bus'|'BusAlt'|'BusinessTime'|'BusSimple'|'C'|'Cab'|'Cake'|'CakeCandles'|'Calculator'|'Calendar'|'CalendarAlt'|'CalendarCheck'|'CalendarDay'|'CalendarDays'|'CalendarMinus'|'CalendarPlus'|'CalendarTimes'|'CalendarWeek'|'CalendarXmark'|'Camera'|'CameraAlt'|'CameraRetro'|'CameraRotate'|'Campground'|'Cancel'|'CandyCane'|'Cannabis'|'Capsules'|'Car'|'CarAlt'|'Caravan'|'CarBattery'|'CarCrash'|'CaretDown'|'CaretLeft'|'CaretRight'|'CaretSquareDown'|'CaretSquareLeft'|'CaretSquareRight'|'CaretSquareUp'|'CaretUp'|'CarRear'|'CarriageBaby'|'Carrot'|'CarSide'|'CartArrowDown'|'CartFlatbed'|'CartFlatbedSuitcase'|'CartPlus'|'CartShopping'|'CashRegister'|'Cat'|'CediSign'|'CentSign'|'Certificate'|'Chain'|'ChainBroken'|'ChainSlash'|'Chair'|'Chalkboard'|'ChalkboardTeacher'|'ChalkboardUser'|'ChampagneGlasses'|'ChargingStation'|'ChartArea'|'ChartBar'|'ChartColumn'|'ChartGantt'|'ChartLine'|'ChartPie'|'Check'|'CheckCircle'|'CheckDouble'|'CheckSquare'|'CheckToSlot'|'Cheese'|'Chess'|'ChessBishop'|'ChessBoard'|'ChessKing'|'ChessKnight'|'ChessPawn'|'ChessQueen'|'ChessRook'|'ChevronCircleDown'|'ChevronCircleLeft'|'ChevronCircleRight'|'ChevronCircleUp'|'ChevronDown'|'ChevronLeft'|'ChevronRight'|'ChevronUp'|'Child'|'Church'|'Circle'|'CircleArrowDown'|'CircleArrowLeft'|'CircleArrowRight'|'CircleArrowUp'|'CircleCheck'|'CircleChevronDown'|'CircleChevronLeft'|'CircleChevronRight'|'CircleChevronUp'|'CircleDollarToSlot'|'CircleDot'|'CircleDown'|'CircleExclamation'|'CircleH'|'CircleHalfStroke'|'CircleInfo'|'CircleLeft'|'CircleMinus'|'CircleNotch'|'CirclePause'|'CirclePlay'|'CirclePlus'|'CircleQuestion'|'CircleRadiation'|'CircleRight'|'CircleStop'|'CircleUp'|'CircleUser'|'CircleXmark'|'City'|'Clapperboard'|'ClinicMedical'|'Clipboard'|'ClipboardCheck'|'ClipboardList'|'Clock'|'ClockFour'|'ClockRotateLeft'|'Clone'|'Close'|'ClosedCaptioning'|'Cloud'|'CloudArrowDown'|'CloudArrowUp'|'CloudDownload'|'CloudDownloadAlt'|'CloudMeatball'|'CloudMoon'|'CloudMoonRain'|'CloudRain'|'CloudShowersHeavy'|'CloudSun'|'CloudSunRain'|'CloudUpload'|'CloudUploadAlt'|'Clover'|'Cny'|'Cocktail'|'Code'|'CodeBranch'|'CodeCommit'|'CodeCompare'|'CodeFork'|'CodeMerge'|'CodePullRequest'|'Coffee'|'Cog'|'Cogs'|'Coins'|'ColonSign'|'Columns'|'Comment'|'CommentAlt'|'CommentDollar'|'CommentDots'|'Commenting'|'CommentMedical'|'Comments'|'CommentsDollar'|'CommentSlash'|'CommentSms'|'CompactDisc'|'Compass'|'CompassDrafting'|'Compress'|'CompressAlt'|'CompressArrowsAlt'|'ComputerMouse'|'ConciergeBell'|'ContactBook'|'ContactCard'|'Cookie'|'CookieBite'|'Copy'|'Copyright'|'Couch'|'CreditCard'|'CreditCardAlt'|'Crop'|'CropAlt'|'CropSimple'|'Cross'|'Crosshairs'|'Crow'|'Crown'|'Crutch'|'CruzeiroSign'|'Cube'|'Cubes'|'Cut'|'Cutlery'|'D'|'Dashboard'|'Database'|'Deaf'|'Deafness'|'Dedent'|'DeleteLeft'|'Democrat'|'Desktop'|'DesktopAlt'|'Dharmachakra'|'Diagnoses'|'DiagramNext'|'DiagramPredecessor'|'DiagramProject'|'DiagramSuccessor'|'Diamond'|'DiamondTurnRight'|'Dice'|'DiceD20'|'DiceD6'|'DiceFive'|'DiceFour'|'DiceOne'|'DiceSix'|'DiceThree'|'DiceTwo'|'DigitalTachograph'|'Directions'|'Disease'|'Divide'|'Dizzy'|'Dna'|'Dog'|'Dollar'|'DollarSign'|'Dolly'|'DollyBox'|'DollyFlatbed'|'Donate'|'DongSign'|'DoorClosed'|'DoorOpen'|'DotCircle'|'Dove'|'DownLeftAndUpRightToCenter'|'Download'|'DownLong'|'DraftingCompass'|'Dragon'|'DrawPolygon'|'DriversLicense'|'Droplet'|'DropletSlash'|'Drum'|'DrumSteelpan'|'DrumstickBite'|'Dumbbell'|'Dumpster'|'DumpsterFire'|'Dungeon'|'E'|'EarDeaf'|'EarListen'|'Earth'|'EarthAfrica'|'EarthAmerica'|'EarthAmericas'|'EarthAsia'|'EarthEurope'|'EarthOceania'|'Edit'|'Egg'|'Eject'|'Elevator'|'Ellipsis'|'EllipsisH'|'EllipsisV'|'EllipsisVertical'|'Envelope'|'EnvelopeOpen'|'EnvelopeOpenText'|'EnvelopesBulk'|'EnvelopeSquare'|'Equals'|'Eraser'|'Ethernet'|'Eur'|'Euro'|'EuroSign'|'Exchange'|'ExchangeAlt'|'Exclamation'|'ExclamationCircle'|'ExclamationTriangle'|'Expand'|'ExpandAlt'|'ExpandArrowsAlt'|'ExternalLink'|'ExternalLinkAlt'|'ExternalLinkSquare'|'ExternalLinkSquareAlt'|'Eye'|'EyeDropper'|'EyeDropperEmpty'|'EyeLowVision'|'EyeSlash'|'F'|'FaceAngry'|'FaceDizzy'|'FaceFlushed'|'FaceFrown'|'FaceFrownOpen'|'FaceGrimace'|'FaceGrin'|'FaceGrinBeam'|'FaceGrinBeamSweat'|'FaceGrinHearts'|'FaceGrinSquint'|'FaceGrinSquintTears'|'FaceGrinStars'|'FaceGrinTears'|'FaceGrinTongue'|'FaceGrinTongueSquint'|'FaceGrinTongueWink'|'FaceGrinWide'|'FaceGrinWink'|'FaceKiss'|'FaceKissBeam'|'FaceKissWinkHeart'|'FaceLaugh'|'FaceLaughBeam'|'FaceLaughSquint'|'FaceLaughWink'|'FaceMeh'|'FaceMehBlank'|'FaceRollingEyes'|'FaceSadCry'|'FaceSadTear'|'FaceSmile'|'FaceSmileBeam'|'FaceSmileWink'|'FaceSurprise'|'FaceTired'|'Fan'|'FastBackward'|'FastForward'|'Faucet'|'Fax'|'Feather'|'FeatherAlt'|'FeatherPointed'|'Feed'|'Female'|'FighterJet'|'File'|'FileAlt'|'FileArchive'|'FileArrowDown'|'FileArrowUp'|'FileAudio'|'FileClipboard'|'FileCode'|'FileContract'|'FileCsv'|'FileDownload'|'FileExcel'|'FileExport'|'FileImage'|'FileImport'|'FileInvoice'|'FileInvoiceDollar'|'FileLines'|'FileMedical'|'FileMedicalAlt'|'FilePdf'|'FilePowerpoint'|'FilePrescription'|'FileSignature'|'FileText'|'FileUpload'|'FileVideo'|'FileWaveform'|'FileWord'|'FileZipper'|'Fill'|'FillDrip'|'Film'|'Filter'|'FilterCircleDollar'|'FilterCircleXmark'|'Fingerprint'|'Fire'|'FireAlt'|'FireExtinguisher'|'FireFlameCurved'|'FireFlameSimple'|'FirstAid'|'Fish'|'FistRaised'|'Flag'|'FlagCheckered'|'FlagUsa'|'Flask'|'FloppyDisk'|'FlorinSign'|'Flushed'|'Folder'|'FolderMinus'|'FolderOpen'|'FolderPlus'|'FolderTree'|'Font'|'FontAwesome'|'FontAwesomeFlag'|'FontAwesomeLogoFull'|'Football'|'FootballBall'|'Forward'|'ForwardFast'|'ForwardStep'|'FrancSign'|'Frog'|'Frown'|'FrownOpen'|'FunnelDollar'|'Futbol'|'FutbolBall'|'G'|'Gamepad'|'GasPump'|'Gauge'|'GaugeHigh'|'GaugeMed'|'GaugeSimple'|'GaugeSimpleHigh'|'GaugeSimpleMed'|'Gavel'|'Gbp'|'Gear'|'Gears'|'Gem'|'Genderless'|'Ghost'|'Gift'|'Gifts'|'GlassCheers'|'Glasses'|'GlassMartini'|'GlassMartiniAlt'|'GlassWhiskey'|'Globe'|'GlobeAfrica'|'GlobeAmericas'|'GlobeAsia'|'GlobeEurope'|'GlobeOceania'|'GolfBall'|'GolfBallTee'|'Gopuram'|'GraduationCap'|'GreaterThan'|'GreaterThanEqual'|'Grimace'|'Grin'|'GrinAlt'|'GrinBeam'|'GrinBeamSweat'|'GrinHearts'|'GrinSquint'|'GrinSquintTears'|'GrinStars'|'GrinTears'|'GrinTongue'|'GrinTongueSquint'|'GrinTongueWink'|'GrinWink'|'Grip'|'GripHorizontal'|'GripLines'|'GripLinesVertical'|'GripVertical'|'GuaraniSign'|'Guitar'|'Gun'|'H'|'Hamburger'|'Hammer'|'Hamsa'|'Hand'|'HandBackFist'|'HandDots'|'HandFist'|'HandHolding'|'HandHoldingDollar'|'HandHoldingDroplet'|'HandHoldingHeart'|'HandHoldingMedical'|'HandHoldingUsd'|'HandHoldingWater'|'HandLizard'|'HandMiddleFinger'|'HandPaper'|'HandPeace'|'HandPointDown'|'HandPointer'|'HandPointLeft'|'HandPointRight'|'HandPointUp'|'HandRock'|'Hands'|'HandsAmericanSignLanguageInterpreting'|'HandsAslInterpreting'|'HandsBubbles'|'HandScissors'|'HandsClapping'|'Handshake'|'HandshakeAltSlash'|'HandshakeAngle'|'HandshakeSimpleSlash'|'HandshakeSlash'|'HandsHelping'|'HandsHolding'|'HandSparkles'|'HandSpock'|'HandsPraying'|'HandsWash'|'Hanukiah'|'HardDrive'|'HardHat'|'HardOfHearing'|'Hashtag'|'HatCowboy'|'HatCowboySide'|'HatHard'|'HatWizard'|'Hdd'|'Header'|'Heading'|'Headphones'|'HeadphonesAlt'|'HeadphonesSimple'|'Headset'|'HeadSideCough'|'HeadSideCoughSlash'|'HeadSideMask'|'HeadSideVirus'|'Heart'|'Heartbeat'|'HeartBroken'|'HeartCrack'|'HeartMusicCameraBolt'|'HeartPulse'|'Helicopter'|'HelmetSafety'|'Highlighter'|'Hiking'|'Hippo'|'History'|'HockeyPuck'|'HollyBerry'|'Home'|'HomeAlt'|'HomeLg'|'HomeLgAlt'|'HomeUser'|'Horse'|'HorseHead'|'Hospital'|'HospitalAlt'|'HospitalSymbol'|'HospitalUser'|'HospitalWide'|'Hotdog'|'Hotel'|'HotTub'|'HotTubPerson'|'Hourglass'|'Hourglass1'|'Hourglass2'|'Hourglass3'|'HourglassEmpty'|'HourglassEnd'|'HourglassHalf'|'HourglassStart'|'House'|'HouseChimney'|'HouseChimneyCrack'|'HouseChimneyMedical'|'HouseChimneyUser'|'HouseChimneyWindow'|'HouseCrack'|'HouseDamage'|'HouseLaptop'|'HouseMedical'|'HouseUser'|'Hryvnia'|'HryvniaSign'|'HSquare'|'I'|'IceCream'|'Icicles'|'Icons'|'ICursor'|'IdBadge'|'IdCard'|'IdCardAlt'|'IdCardClip'|'Igloo'|'Ils'|'Image'|'ImagePortrait'|'Images'|'Inbox'|'Indent'|'IndianRupee'|'IndianRupeeSign'|'Industry'|'Infinity'|'Info'|'InfoCircle'|'Inr'|'Institution'|'Italic'|'J'|'Jedi'|'JetFighter'|'Joint'|'JournalWhills'|'Jpy'|'K'|'Kaaba'|'Key'|'Keyboard'|'Khanda'|'KipSign'|'Kiss'|'KissBeam'|'KissWinkHeart'|'KitMedical'|'KiwiBird'|'Krw'|'L'|'LadderWater'|'Landmark'|'Language'|'Laptop'|'LaptopCode'|'LaptopHouse'|'LaptopMedical'|'LariSign'|'Laugh'|'LaughBeam'|'LaughSquint'|'LaughWink'|'LayerGroup'|'Leaf'|'LeftLong'|'LeftRight'|'Legal'|'Lemon'|'LessThan'|'LessThanEqual'|'LevelDown'|'LevelDownAlt'|'LevelUp'|'LevelUpAlt'|'LifeRing'|'Lightbulb'|'LineChart'|'Link'|'LinkSlash'|'LiraSign'|'List'|'List12'|'ListAlt'|'ListCheck'|'ListDots'|'ListNumeric'|'ListOl'|'ListSquares'|'ListUl'|'LitecoinSign'|'Location'|'LocationArrow'|'LocationCrosshairs'|'LocationDot'|'LocationPin'|'Lock'|'LockOpen'|'LongArrowAltDown'|'LongArrowAltLeft'|'LongArrowAltRight'|'LongArrowAltUp'|'LongArrowDown'|'LongArrowLeft'|'LongArrowRight'|'LongArrowUp'|'LowVision'|'LuggageCart'|'Lungs'|'LungsVirus'|'M'|'Magic'|'MagicWandSparkles'|'Magnet'|'MagnifyingGlass'|'MagnifyingGlassDollar'|'MagnifyingGlassLocation'|'MagnifyingGlassMinus'|'MagnifyingGlassPlus'|'MailBulk'|'MailForward'|'MailReply'|'MailReplyAll'|'Male'|'ManatSign'|'Map'|'MapLocation'|'MapLocationDot'|'MapMarked'|'MapMarkedAlt'|'MapMarker'|'MapMarkerAlt'|'MapPin'|'MapSigns'|'Marker'|'Mars'|'MarsAndVenus'|'MarsDouble'|'MarsStroke'|'MarsStrokeH'|'MarsStrokeRight'|'MarsStrokeUp'|'MarsStrokeV'|'MartiniGlass'|'MartiniGlassCitrus'|'MartiniGlassEmpty'|'Mask'|'MaskFace'|'MasksTheater'|'Maximize'|'Medal'|'Medkit'|'Meh'|'MehBlank'|'MehRollingEyes'|'Memory'|'Menorah'|'Mercury'|'Message'|'Meteor'|'Microchip'|'Microphone'|'MicrophoneAlt'|'MicrophoneAltSlash'|'MicrophoneLines'|'MicrophoneLinesSlash'|'MicrophoneSlash'|'Microscope'|'MillSign'|'Minimize'|'Minus'|'MinusCircle'|'MinusSquare'|'Mitten'|'Mobile'|'MobileAlt'|'MobileAndroid'|'MobileButton'|'MobilePhone'|'MobileScreenButton'|'MoneyBill'|'MoneyBill1'|'MoneyBill1Wave'|'MoneyBillAlt'|'MoneyBillWave'|'MoneyBillWaveAlt'|'MoneyCheck'|'MoneyCheckAlt'|'MoneyCheckDollar'|'Monument'|'Moon'|'MortarBoard'|'MortarPestle'|'Mosque'|'Motorcycle'|'Mountain'|'Mouse'|'MousePointer'|'MugHot'|'MugSaucer'|'Multiply'|'Museum'|'Music'|'N'|'NairaSign'|'Navicon'|'NetworkWired'|'Neuter'|'Newspaper'|'NotEqual'|'NotesMedical'|'NoteSticky'|'O'|'ObjectGroup'|'ObjectUngroup'|'OilCan'|'Om'|'Otter'|'Outdent'|'P'|'Pager'|'Paintbrush'|'PaintRoller'|'Palette'|'Pallet'|'Panorama'|'Paperclip'|'PaperPlane'|'ParachuteBox'|'Paragraph'|'Parking'|'Passport'|'Pastafarianism'|'Paste'|'Pause'|'PauseCircle'|'Paw'|'Peace'|'Pen'|'PenAlt'|'Pencil'|'PencilAlt'|'PencilRuler'|'PencilSquare'|'PenClip'|'PenFancy'|'PenNib'|'PenRuler'|'PenSquare'|'PenToSquare'|'PeopleArrows'|'PeopleArrowsLeftRight'|'PeopleCarry'|'PeopleCarryBox'|'PepperHot'|'Percent'|'Percentage'|'Person'|'PersonBiking'|'PersonBooth'|'PersonDotsFromLine'|'PersonDress'|'PersonHiking'|'PersonPraying'|'PersonRunning'|'PersonSkating'|'PersonSkiing'|'PersonSkiingNordic'|'PersonSnowboarding'|'PersonSwimming'|'PersonWalking'|'PersonWalkingWithCane'|'PesetaSign'|'PesoSign'|'Phone'|'PhoneAlt'|'PhoneFlip'|'PhoneSlash'|'PhoneSquare'|'PhoneSquareAlt'|'PhoneVolume'|'PhotoFilm'|'PhotoVideo'|'PieChart'|'PiggyBank'|'Pills'|'PingPongPaddleBall'|'PizzaSlice'|'PlaceOfWorship'|'Plane'|'PlaneArrival'|'PlaneDeparture'|'PlaneSlash'|'Play'|'PlayCircle'|'Plug'|'Plus'|'PlusCircle'|'PlusMinus'|'PlusSquare'|'Podcast'|'Poll'|'PollH'|'Poo'|'PooBolt'|'Poop'|'PooStorm'|'Portrait'|'PoundSign'|'PowerOff'|'Pray'|'PrayingHands'|'Prescription'|'PrescriptionBottle'|'PrescriptionBottleAlt'|'PrescriptionBottleMedical'|'Print'|'Procedures'|'ProjectDiagram'|'PumpMedical'|'PumpSoap'|'PuzzlePiece'|'Q'|'Qrcode'|'Question'|'QuestionCircle'|'Quidditch'|'QuidditchBroomBall'|'QuoteLeft'|'QuoteLeftAlt'|'QuoteRight'|'QuoteRightAlt'|'Quran'|'R'|'Radiation'|'RadiationAlt'|'Rainbow'|'Random'|'Receipt'|'RecordVinyl'|'RectangleAd'|'RectangleList'|'RectangleTimes'|'RectangleXmark'|'Recycle'|'Redo'|'RedoAlt'|'Refresh'|'Registered'|'Remove'|'RemoveFormat'|'Reorder'|'Repeat'|'Reply'|'ReplyAll'|'Republican'|'Restroom'|'Retweet'|'Ribbon'|'RightFromBracket'|'RightLeft'|'RightLong'|'RightToBracket'|'Ring'|'Rmb'|'Road'|'Robot'|'Rocket'|'Rotate'|'RotateBack'|'RotateBackward'|'RotateForward'|'RotateLeft'|'RotateRight'|'Rouble'|'Route'|'Rss'|'RssSquare'|'Rub'|'Ruble'|'RubleSign'|'Ruler'|'RulerCombined'|'RulerHorizontal'|'RulerVertical'|'Running'|'Rupee'|'RupeeSign'|'RupiahSign'|'S'|'SadCry'|'SadTear'|'Sailboat'|'Satellite'|'SatelliteDish'|'Save'|'ScaleBalanced'|'ScaleUnbalanced'|'ScaleUnbalancedFlip'|'School'|'Scissors'|'Screwdriver'|'ScrewdriverWrench'|'Scroll'|'ScrollTorah'|'SdCard'|'Search'|'SearchDollar'|'SearchLocation'|'SearchMinus'|'SearchPlus'|'Section'|'Seedling'|'Server'|'Shapes'|'Share'|'ShareAlt'|'ShareAltSquare'|'ShareFromSquare'|'ShareNodes'|'ShareSquare'|'Shekel'|'ShekelSign'|'Sheqel'|'SheqelSign'|'Shield'|'ShieldAlt'|'ShieldBlank'|'ShieldVirus'|'Ship'|'ShippingFast'|'Shirt'|'ShoePrints'|'Shop'|'ShoppingBag'|'ShoppingBasket'|'ShoppingCart'|'ShopSlash'|'Shower'|'Shrimp'|'Shuffle'|'ShuttleSpace'|'ShuttleVan'|'Sign'|'Signal'|'Signal5'|'SignalPerfect'|'Signature'|'SignHanging'|'SignIn'|'SignInAlt'|'Signing'|'SignLanguage'|'SignOut'|'SignOutAlt'|'SignsPost'|'SimCard'|'Sink'|'Sitemap'|'Skating'|'Skiing'|'SkiingNordic'|'Skull'|'SkullCrossbones'|'Slash'|'Sleigh'|'Sliders'|'SlidersH'|'Smile'|'SmileBeam'|'SmileWink'|'Smog'|'Smoking'|'SmokingBan'|'Sms'|'Snowboarding'|'Snowflake'|'Snowman'|'Snowplow'|'Soap'|'SoccerBall'|'Socks'|'SolarPanel'|'Sort'|'SortAlphaAsc'|'SortAlphaDesc'|'SortAlphaDown'|'SortAlphaDownAlt'|'SortAlphaUp'|'SortAlphaUpAlt'|'SortAmountAsc'|'SortAmountDesc'|'SortAmountDown'|'SortAmountDownAlt'|'SortAmountUp'|'SortAmountUpAlt'|'SortAsc'|'SortDesc'|'SortDown'|'SortNumericAsc'|'SortNumericDesc'|'SortNumericDown'|'SortNumericDownAlt'|'SortNumericUp'|'SortNumericUpAlt'|'SortUp'|'Spa'|'SpaceShuttle'|'SpaghettiMonsterFlying'|'SpellCheck'|'Spider'|'Spinner'|'Splotch'|'Spoon'|'SprayCan'|'SprayCanSparkles'|'Sprout'|'Square'|'SquareArrowUpRight'|'SquareCaretDown'|'SquareCaretLeft'|'SquareCaretRight'|'SquareCaretUp'|'SquareCheck'|'SquareEnvelope'|'SquareFull'|'SquareH'|'SquareMinus'|'SquareParking'|'SquarePen'|'SquarePhone'|'SquarePhoneFlip'|'SquarePlus'|'SquarePollHorizontal'|'SquarePollVertical'|'SquareRootAlt'|'SquareRootVariable'|'SquareRss'|'SquareShareNodes'|'SquareUpRight'|'SquareXmark'|'Stairs'|'Stamp'|'Star'|'StarAndCrescent'|'StarHalf'|'StarHalfAlt'|'StarHalfStroke'|'StarOfDavid'|'StarOfLife'|'StepBackward'|'StepForward'|'SterlingSign'|'Stethoscope'|'StickyNote'|'Stop'|'StopCircle'|'Stopwatch'|'Stopwatch20'|'Store'|'StoreAlt'|'StoreAltSlash'|'StoreSlash'|'Stream'|'StreetView'|'Strikethrough'|'Stroopwafel'|'Subscript'|'Subtract'|'Subway'|'Suitcase'|'SuitcaseMedical'|'SuitcaseRolling'|'Sun'|'Superscript'|'Surprise'|'Swatchbook'|'Swimmer'|'SwimmingPool'|'Synagogue'|'Sync'|'SyncAlt'|'Syringe'|'T'|'Table'|'TableCells'|'TableCellsLarge'|'TableColumns'|'TableList'|'Tablet'|'TabletAlt'|'TabletAndroid'|'TabletButton'|'TableTennis'|'TableTennisPaddleBall'|'Tablets'|'TabletScreenButton'|'TachographDigital'|'Tachometer'|'TachometerAlt'|'TachometerAltAverage'|'TachometerAltFast'|'TachometerAverage'|'TachometerFast'|'Tag'|'Tags'|'Tape'|'Tasks'|'TasksAlt'|'Taxi'|'Teeth'|'TeethOpen'|'Teletype'|'Television'|'Temperature0'|'Temperature1'|'Temperature2'|'Temperature3'|'Temperature4'|'TemperatureEmpty'|'TemperatureFull'|'TemperatureHalf'|'TemperatureHigh'|'TemperatureLow'|'TemperatureQuarter'|'TemperatureThreeQuarters'|'Tenge'|'TengeSign'|'Terminal'|'TextHeight'|'TextSlash'|'TextWidth'|'Th'|'TheaterMasks'|'Thermometer'|'Thermometer0'|'Thermometer1'|'Thermometer2'|'Thermometer3'|'Thermometer4'|'ThermometerEmpty'|'ThermometerFull'|'ThermometerHalf'|'ThermometerQuarter'|'ThermometerThreeQuarters'|'ThLarge'|'ThList'|'ThumbsDown'|'ThumbsUp'|'Thumbtack'|'Ticket'|'TicketAlt'|'TicketSimple'|'Timeline'|'Times'|'TimesCircle'|'TimesRectangle'|'TimesSquare'|'Tint'|'TintSlash'|'Tired'|'ToggleOff'|'ToggleOn'|'Toilet'|'ToiletPaper'|'ToiletPaperSlash'|'Toolbox'|'Tools'|'Tooth'|'Torah'|'ToriiGate'|'TowerBroadcast'|'Tractor'|'Trademark'|'TrafficLight'|'Trailer'|'Train'|'TrainSubway'|'TrainTram'|'Tram'|'Transgender'|'TransgenderAlt'|'Trash'|'TrashAlt'|'TrashArrowUp'|'TrashCan'|'TrashCanArrowUp'|'TrashRestore'|'TrashRestoreAlt'|'Tree'|'TriangleCircleSquare'|'TriangleExclamation'|'Trophy'|'Truck'|'TruckFast'|'TruckLoading'|'TruckMedical'|'TruckMonster'|'TruckMoving'|'TruckPickup'|'TruckRampBox'|'Try'|'TShirt'|'Tty'|'TurkishLira'|'TurkishLiraSign'|'TurnDown'|'TurnUp'|'Tv'|'TvAlt'|'U'|'Umbrella'|'UmbrellaBeach'|'Underline'|'Undo'|'UndoAlt'|'UniversalAccess'|'University'|'Unlink'|'Unlock'|'UnlockAlt'|'UnlockKeyhole'|'Unsorted'|'UpDown'|'UpDownLeftRight'|'Upload'|'UpLong'|'UpRightAndDownLeftFromCenter'|'UpRightFromSquare'|'Usd'|'User'|'UserAlt'|'UserAltSlash'|'UserAstronaut'|'UserCheck'|'UserCircle'|'UserClock'|'UserCog'|'UserDoctor'|'UserEdit'|'UserFriends'|'UserGear'|'UserGraduate'|'UserGroup'|'UserInjured'|'UserLarge'|'UserLargeSlash'|'UserLock'|'UserMd'|'UserMinus'|'UserNinja'|'UserNurse'|'UserPen'|'UserPlus'|'Users'|'UsersCog'|'UserSecret'|'UsersGear'|'UserShield'|'UserSlash'|'UsersSlash'|'UserTag'|'UserTie'|'UserTimes'|'UserXmark'|'Utensils'|'UtensilSpoon'|'V'|'VanShuttle'|'Vault'|'Vcard'|'VectorSquare'|'Venus'|'VenusDouble'|'VenusMars'|'Vest'|'VestPatches'|'Vial'|'Vials'|'Video'|'VideoCamera'|'VideoSlash'|'Vihara'|'Virus'|'VirusCovid'|'VirusCovidSlash'|'Viruses'|'VirusSlash'|'Voicemail'|'Volleyball'|'VolleyballBall'|'VolumeControlPhone'|'VolumeDown'|'VolumeHigh'|'VolumeLow'|'VolumeMute'|'VolumeOff'|'VolumeTimes'|'VolumeUp'|'VolumeXmark'|'VoteYea'|'VrCardboard'|'W'|'Walking'|'Wallet'|'WandMagic'|'WandMagicSparkles'|'WandSparkles'|'Warehouse'|'Warning'|'Water'|'WaterLadder'|'WaveSquare'|'Weight'|'WeightHanging'|'WeightScale'|'Wheelchair'|'WhiskeyGlass'|'Wifi'|'Wifi3'|'WifiStrong'|'Wind'|'WindowClose'|'WindowMaximize'|'WindowMinimize'|'WindowRestore'|'WineBottle'|'WineGlass'|'WineGlassAlt'|'WineGlassEmpty'|'Won'|'WonSign'|'Wrench'|'X'|'Xmark'|'XmarkCircle'|'XmarkSquare'|'XRay'|'Y'|'Yen'|'YenSign'|'YinYang'|'Z'|'Zap';

    /**
     * A device / controller type / etc settings field
     */
    export type SettingsField = SettingsFieldText | SettingsFieldNumber | SettingsFieldCheckbox | SettingsFieldRadio | SettingsFieldSelect | SettingsFieldHorizontalWrapper | SettingsFieldContainer;
    /**
     * Similar to SettingsField but without SettingsFieldHorizontalWrapper and SettingsFieldContainer
     */
    export type SettingsFieldWithoutContainer = Exclude<HMApi.SettingsField, SettingsFieldContainer | SettingsFieldHorizontalWrapper>
}