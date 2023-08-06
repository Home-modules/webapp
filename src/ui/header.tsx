import React from "react";
import "./header.scss"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, To } from "react-router-dom";
import { faArrowLeft, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import ScrollView, { ScrollViewProps } from "./scrollbar";

export type HeaderButtonProps = {
    icon: IconDefinition,
    label: string,
    attention?: boolean,
    onClick: React.MouseEventHandler<HTMLButtonElement>,
} | {
    content: JSX.Element
}

export type HeaderProps = {
    title: string;
    subtitle?: string;
    buttons?: HeaderButtonProps[];
    backLink?: To,
    search?: {
        value: string | null,
        onChange(query: string | null): void
    },
    select?: {
        totalCount: number,
        selectedCount: number,
        onToggle(checked: boolean): void,
        buttons?: HeaderButtonProps[],
    }
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
    function Header({ title, buttons, backLink, subtitle, search, select }, ref) {
        const selectActive = select ? select.selectedCount > 0 : false;
        const searchActive = search && search.value !== null && !selectActive;
        const searchFieldRef = React.useRef<HTMLInputElement>(null);
        const titleActive = !(selectActive || searchActive);

        if (search) {
            buttons = [...(buttons || []), {
                icon: faSearch,
                label: "Search",
                onClick() {
                    search.onChange("");
                }
            }]
        }

        React.useEffect(() => {
            if (searchActive) searchFieldRef.current?.focus();
        }, [searchActive])

        return (
            <header ref={ref}>
                <div
                    className={`main ${titleActive ? "" : "hidden"}`}
                    //@ts-ignore
                    inert={titleActive ? undefined : ""}
                >
                    {backLink && (
                        <Link to={backLink} className="icon back">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                    )}
                    <div className="title">
                        <h1>{title}</h1>
                        {subtitle && <div className="subtitle">{subtitle}</div>}
                    </div>
                    <div className="buttons right">
                        {buttons?.map((props, index) => <HeaderButton key={index} {...props} />)}
                    </div>
                </div>
                {search && (
                    <div
                        className={`search ${searchActive ? "" : "hidden"}`}
                        //@ts-ignore
                        inert={searchActive ? undefined : ""}
                    >
                        <FontAwesomeIcon icon={faSearch} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search.value || ""}
                            onChange={e => search.onChange(e.target.value)}
                            ref={searchFieldRef}
                            onKeyDown={e => { if (e.key === "Escape") search.onChange(null) }}
                        />
                        <HeaderButton
                            icon={faTimes}
                            label="Close search"
                            onClick={() => search.onChange(null)}
                        />
                    </div>
                )}
                {select && (
                    <div
                        className={`select ${selectActive ? "" : "hidden"}`}
                        //@ts-ignore
                        inert={selectActive ? undefined : ""}
                    >
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={select.selectedCount === select.totalCount}
                                onChange={e => select.onToggle(e.target.checked)}
                                title="Select all"
                            />
                        </label>
                        <h1>{select.selectedCount}</h1>
                        <div className="buttons right">
                            {select.buttons?.map((props, index) => <HeaderButton key={index} {...props} />)}
                            <HeaderButton
                                icon={faTimes}
                                label="Cancel"
                                onClick={() => select.onToggle(false)}
                            />
                        </div>
                    </div>
                )}
            </header>
        )
    }
);

function HeaderButton(props: HeaderButtonProps) {
    if ('content' in props) return props.content;
    const { icon, label, onClick, attention = false } = props;
    return (
        <button
            className={`icon ${attention ? "attention" : ""}`}
            title={label}
            onClick={onClick}
        >
            <FontAwesomeIcon icon={icon} />
        </button>
    )
}

export type PageWithHeaderProps = {
    children: React.ReactChild | React.ReactChild[];
} & HeaderProps & ScrollViewProps

export function PageWithHeader({
    children,
    title, buttons, backLink, subtitle, search, select,
    className = '', style, ref: _, ...rest
}: PageWithHeaderProps) {

    const headerRef = React.useRef<HTMLElement>(null);
    const [height, setHeight] = React.useState(0);

    React.useEffect(() => {
        if (headerRef.current)
            setHeight(headerRef.current.clientHeight);
    }, []);

    return (
        <ScrollView
            {...rest}
            className={`${className} page-with-header`}
            style={{ ...style, "--header-height": height + "px" } as any}
        >
            <Header
                title={title} buttons={buttons} backLink={backLink} subtitle={subtitle} search={search} select={select}
                ref={headerRef}
            />
            <div className="content">
                {children}
            </div>
        </ScrollView>
    )
}