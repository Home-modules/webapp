import React from 'react';
import { HMApi } from '../../hub/api';
import promiseTimeout from '../../utils/promise-timeout';
import DropDownSelect, { DropDownSelectOption } from './dropdown';


export type LazyDropDownSelectProps = {
    className?: string;
    lazyOptions: HMApi.T.SettingsField.SelectLazyOptions;
    callback():
        (HMApi.T.SettingsField.SelectOption | HMApi.T.SettingsField.SelectOptionGroup)[] |
        { error: true } |
        Promise<
            (HMApi.T.SettingsField.SelectOption | HMApi.T.SettingsField.SelectOptionGroup)[] |
            { error: true; }
        >;
    value: string | DropDownSelectOption<string>;
    onChange: (value: string) => void;
    allowCustomValue?: boolean;
    showSearchBar?: boolean | number;
    error?: string;
    onOpen?: () => void;
};

export function LazyDropDownSelect({ className, callback, lazyOptions, onChange, value, allowCustomValue, showSearchBar, error, onOpen }: LazyDropDownSelectProps) {
    type OptionsState =
        0 |
        (HMApi.T.SettingsField.SelectOption | HMApi.T.SettingsField.SelectOptionGroup)[] |
        { error: true; params?: Record<string, string>; } |
        { error: false; params?: undefined; }; // Other errors
    const [options, setOptions] = React.useState<OptionsState>(0);

    const [pulse, setPulse] = React.useState(false);

    const loadItems = React.useCallback(function loadItems() {
        const returned = callback();
        if (returned instanceof Promise) {
            promiseTimeout(returned, 75, () => {
                if (!(options instanceof Array)) { // Don't show loading indicator if loaded before
                    setOptions(0);
                }
            }, () => {
                setPulse(true); // The pulse rotates the loading indicator by 180 degrees as a haptic feedback.
                setTimeout(() => {
                    setPulse(false);
                }, 550);
            }).then(setOptions, setOptions);
        } else {
            setOptions(returned);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Fixing whe warning here would actually introduce a bug which causes the list to be repeatedly loaded

    React.useEffect(() => {
        if (lazyOptions.loadOn === 'render') {
            loadItems();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadItems]); // Here too

    let showRefresh = lazyOptions.showRefreshButton;
    if (!showRefresh) {
        showRefresh = {}; // All properties are optional so an empty object will suffice
    }
    if (showRefresh === true) {
        showRefresh = {
            whenNormal: true,
            whenEmpty: true,
            whenError: true,
            whenLoading: true
        };
    }
    if (showRefresh instanceof Array) {
        showRefresh = {
            whenNormal: showRefresh[0],
            whenEmpty: showRefresh[0],
            whenError: showRefresh[0],
            whenLoading: showRefresh[0],
            buttonText: showRefresh[1]
        };
    }
    if (typeof showRefresh.buttonText === 'string') {
        showRefresh.buttonText = {
            whenNormal: showRefresh.buttonText,
            whenEmpty: showRefresh.buttonText,
            whenError: showRefresh.buttonText,
            whenLoading: showRefresh.buttonText
        };
    }
    if (showRefresh.buttonText === undefined) {
        showRefresh.buttonText = {
            whenNormal: 'Refresh',
            whenEmpty: 'Refresh',
            whenError: 'Retry',
            whenLoading: 'Refreshing'
        };
    }
    const showRefreshCurrent: [boolean | undefined, string] = options instanceof Array ? (
        options.length === 0 ?
            [showRefresh.whenEmpty, showRefresh.buttonText.whenEmpty || 'Refresh'] :
            [showRefresh.whenNormal, showRefresh.buttonText.whenNormal || 'Refresh']
    ) : (
        typeof options === 'number' ? // Only possible value is 0 (= loading)
            [showRefresh.whenLoading, showRefresh.buttonText.whenLoading || 'Refreshing'] :
            [showRefresh.whenError, showRefresh.buttonText.whenError || 'Retry']
    );
    return (
        <DropDownSelect
            className={className}
            onChange={onChange}
            value={value}
            options={options instanceof Array ? options : []}
            onOpen={() => {
                onOpen?.();
                // Load items when opened on first time OR 
                if ((lazyOptions.loadOn === 'open' && !(options instanceof Array)) || lazyOptions.refreshOnOpen) {
                    loadItems();
                }
            }}
            allowCustomValue={allowCustomValue}
            showSearchBar={showSearchBar}
            refreshButton={showRefreshCurrent[0] ? (showRefreshCurrent[1]) : undefined}
            refreshButtonActive={typeof options === 'number'}
            refreshButtonPulse={pulse}
            onRefreshButton={loadItems}
            error={error}
        >
            {options instanceof Array ? (
                options.length === 0 ? (
                    <div className="empty">
                        {lazyOptions.fallbackTexts?.whenEmpty}
                    </div>
                ) : null
            ) : (
                typeof options === 'number' ? (
                    <div className="loading">
                        {lazyOptions.fallbackTexts?.whenLoading || 'Loading...'}
                    </div>
                ) : (
                    <div className="error">
                        {lazyOptions.fallbackTexts?.whenError || 'Error'}
                    </div>
                )
            )}
        </DropDownSelect>
    );
}
