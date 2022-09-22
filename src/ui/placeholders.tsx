import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "./placeholders.scss";

export type PlaceHoldersProps<T> = {
    className?: string,
    content: T | undefined | null | false,
    loadingPlaceholder?: string,
    errorPlaceholder?: string,
    Wrapper: (children: T) => JSX.Element,
}

export function PlaceHolders<T>({ className = "", content, loadingPlaceholder = "Loading...", errorPlaceholder = "Error", Wrapper }: PlaceHoldersProps<T>) {
    className += " placeholders";

    return (content === null || content === undefined) ? (
        <div className={`${className} loading`}>
            <div className="circle" />
            {loadingPlaceholder}
        </div>
    ) : content === false ? (
        <div className={`${className} error`}>
            <FontAwesomeIcon icon={faTimesCircle} />
            {errorPlaceholder}
        </div>
    ) : Wrapper(content);
}

export type PlaceHoldersArrayProps<T> = {
    className?: string,
    items: T[] | undefined | null | false,
    loadingPlaceholder?: string,
    errorPlaceholder?: string,
    emptyPlaceholder: React.ReactChild | React.ReactChild[],
    Wrapper: (children: T[]) => JSX.Element,
}

export function PlaceHoldersArray<T>({ className, items, loadingPlaceholder, errorPlaceholder, emptyPlaceholder, Wrapper }: PlaceHoldersArrayProps<T>) {
    return (items instanceof Array && !items.length) ? (
        <div className={`${className} placeholders empty`}>
            {emptyPlaceholder}
        </div>
    ) : (
        <PlaceHolders
            loadingPlaceholder={loadingPlaceholder}
            errorPlaceholder={errorPlaceholder}
            className={className}
            content={items}
            Wrapper={Wrapper}
        />
    );
}