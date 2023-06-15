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
    placeholderProps?: React.HTMLAttributes<HTMLDivElement>,
}

export function PlaceHolders<T>({
    className = "",
    content,
    loadingPlaceholder = "Loading...",
    errorPlaceholder = "Error",
    Wrapper,
    placeholderProps = {},
}: PlaceHoldersProps<T>) {
    className += " placeholders";

    return (content === null || content === undefined) ? (
        <div className={`${className} loading`} {...placeholderProps}>
            <div className="circle" />
            {loadingPlaceholder}
        </div>
    ) : content === false ? (
        <div className={`${className} error`} {...placeholderProps}>
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
    placeholderProps?: React.HTMLAttributes<HTMLDivElement>,
}

export function PlaceHoldersArray<T>({
    className,
    items,
    loadingPlaceholder,
    errorPlaceholder,
    emptyPlaceholder,
    Wrapper,
    placeholderProps = {}
}: PlaceHoldersArrayProps<T>) {
    return (items instanceof Array && !items.length) ? (
        <div className={`${className} placeholders empty`} {...placeholderProps}>
            {emptyPlaceholder}
        </div>
    ) : (
        <PlaceHolders
            loadingPlaceholder={loadingPlaceholder}
            errorPlaceholder={errorPlaceholder}
            className={className}
            content={items}
            Wrapper={Wrapper}
            placeholderProps={placeholderProps}
        />
    );
}