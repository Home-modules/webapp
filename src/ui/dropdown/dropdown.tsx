import './dropdown.scss';
import { faChevronDown, faRefresh, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Property as CSSTypeProperty } from 'csstype';
import { SelectGroup, SelectOption } from './options';
import { findOption, searchInDropdownOptions } from './traverse-options';

export type DropDownSelectOption<T extends string> = {
    isGroup?: false;
    label: string;
    value: T;
    subtext?: string;
};

export type DropDownSelectGroup<T extends string> = {
    isGroup: true;
    label: string;
    subtext?: string;
    expanded?: boolean;
    children: DropDownSelectOption<T>[];
};

export type DropDownSelectProps<T extends string= string> = {
    className?: string,
    options: (DropDownSelectOption<T>|DropDownSelectGroup<T>)[];
    onChange: (value: T) => void;
    value: T | DropDownSelectOption<T>;
    onOpen?: ()=> void;
    children?: React.ReactNode|React.ReactNode[]; // Ignored when `options` is not empty
    error?: string;
    allowCustomValue?: boolean;
    showSearchBar?: boolean | number; // If number, it will be the minimum item count to show search bar.
    refreshButton?: string;
    refreshButtonActive?: boolean;
    refreshButtonPulse?: boolean;
    onRefreshButton?: ()=> void;
}

export default function DropDownSelect<T extends string>({
    className, options, onChange, value, onOpen, children, error, allowCustomValue, showSearchBar, onRefreshButton, refreshButton, refreshButtonActive, refreshButtonPulse
}: DropDownSelectProps<T>) {
    const [open, setOpen] = React.useState(false);
    const [closing, setClosing] = React.useState(false);
    const [blurDetectorPointerEvents, setBlurDetectorPointerEvents] = React.useState<CSSTypeProperty.PointerEvents>('auto');
    const [search, setSearch] = React.useState('');
    const currentValue= (typeof value==='string' ? value : value.value);
    const currentOption = searchInDropdownOptions(options, currentValue);
    const [expandedGroups, setExpandedGroups] = React.useState<Record<number, boolean>>(Object.fromEntries(options.map((op, i)=>op.isGroup ? [i, op.expanded!==false] : undefined).filter(Boolean) as [number, boolean][]));
    const [focus, setFocus] = React.useState<T|number>(currentOption ? currentOption.value : -1); // string for options, number for groups, -1 for no focus
    const ref = React.useRef<HTMLDivElement>(null);
    const searchBarRef = React.useRef<HTMLInputElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    
    if(typeof showSearchBar==='number') {
        let totalCount = options.filter(o=>!o.isGroup).length;
        for(let group of options.filter(o=>o.isGroup)) {
            group = group as DropDownSelectGroup<T>;
            totalCount += group.children.length;
        }
        showSearchBar = totalCount>=showSearchBar;
    }

    function close(val?: T) {
        setOpen(false);
        setClosing(true);
        setTimeout(()=> {
            setClosing(false);
            setSearch('');
            val||= currentValue;
            const option = val ? searchInDropdownOptions(options, val) : undefined;
            setFocus(option ? option.value : -1);
        }, 1000);
    }

    function onBlurDetectorWheel(e: React.WheelEvent<HTMLDivElement>) {
        // Scroll the element at the cursor position, except the blur detector itself.
        // To skip the blur detector, we need to temporarily disable its pointer events.
        // Then inject the wheel event into the element at the cursor position.
        // Finally, re-enable the blur detector's pointer events.
        setBlurDetectorPointerEvents('none');
        // Wait for the change to take effect.
        setTimeout(()=> {
            const el = document.elementFromPoint(e.clientX, e.clientY);
            if(el) {
                el.dispatchEvent(new WheelEvent('wheel', e as any));
            }
            setBlurDetectorPointerEvents('auto');
        }, 0);
    }

    function openDropDown() {
        setOpen(true);
        onOpen?.();
    }

    function handleKeys(e: React.KeyboardEvent<HTMLElement>): void {
        // Enter and Ctrl+Space will open the dropdown
        if((!open) && (e.key==='Enter' || (e.key===' ' && e.ctrlKey))) {
            openDropDown();
            searchBarRef.current?.focus();
        }

        if(open && e.key === 'Enter' && typeof focus === 'string') {
            e.preventDefault();
            onChange(focus);
            close(focus);
        }

        if(open && e.key === 'Escape') {
            close();
        }

        if(open && e.key === 'ArrowDown') {
            e.preventDefault();
            if(focus === -1) {
                setFocus(options[0].isGroup ? 0 : options[0].value); // Select first item
            } else {
                if(typeof focus === 'number') {
                    const group = options[focus] as DropDownSelectGroup<T>;
                    if(expandedGroups[focus]) {
                        setFocus(group.children[0].value); // First sub-option
                    } else {
                        const next= options[focus+1];
                        if(!next) return;
                        setFocus(next.isGroup ? focus+1 : next.value); // Next option / group
                    }
                } else {
                    const index = findOption(options, focus);
                    if(index===undefined) return;
                    if(index instanceof Array) {
                        const group = options[index[0]] as DropDownSelectGroup<T>;
                        
                        if(index[1]+1 === group.children.length) {
                            const next= options[index[0]+1];
                            if(!next) return;
                            setFocus(next.isGroup ? index[0]+1 : next.value); // Next option / group out of current group
                        } else {
                            const next= group.children[index[1]+1];
                            if(!next) return;
                            setFocus(next.value); // Next sub-option
                        }
                    } else {
                        const next= options[index+1];
                        if(!next) return;
                        setFocus(next.isGroup ? index+1 : next.value); // Next option / group
                    }
                }
            }
        }

        if(open && e.key === 'ArrowUp') {
            e.preventDefault();
            if(focus === -1) {
                const lastOption = options[options.length-1];
                if(lastOption.isGroup && expandedGroups[options.length-1]) {
                    setFocus(lastOption.children[lastOption.children.length-1].value); // The last item of the last group
                } else {
                    setFocus(lastOption.isGroup ? options.length-1 : lastOption.value); // Select last item
                }
            } else {
                if(typeof focus === 'number') {
                    const prev= options[focus-1];
                    if(prev.isGroup && expandedGroups[focus-1]) {
                        setFocus(prev.children[prev.children.length-1].value); // The last item of previous group
                    } else {
                        setFocus(prev.isGroup ? focus-1 : prev.value); // Previous option / group
                    }
                } else {
                    const index = findOption(options, focus);
                    if(index===undefined) return;
                    if(index instanceof Array) {
                        const group = options[index[0]] as DropDownSelectGroup<T>;
                        if(index[1] === 0) {
                            setFocus(index[0]); // The group containing this sub-option
                        } else {
                            setFocus(group.children[index[1]-1].value); // Previous option / group out of current group
                        }
                    } else {
                        const prev= options[index-1];
                        if(!prev) return;
                        if(prev.isGroup && expandedGroups[index-1]) {
                            setFocus(prev.children[prev.children.length-1].value); // The last item of previous group
                        } else {
                            setFocus(prev.isGroup ? index-1 : prev.value); // Previous option / group
                        }
                    }
                }
            }
        }

        if(open && e.key === 'ArrowLeft') {
            if(typeof focus === 'number') {
                setExpandedGroups(s=>({...s, [focus]: false})); // Collapse the group
            } else {
                const index = findOption(options, focus);
                if(index instanceof Array) {
                    setFocus(index[0]); // The group containing this option
                }
            }
        }

        if(open && e.key === 'ArrowRight' && typeof focus === 'number') {
            if(expandedGroups[focus]) {
                const group = options[focus];
                setFocus(group.isGroup ? group.children[0].value : focus); // First child of the group
            } else {
                setExpandedGroups(s=>({...s, [focus]: true})); // Expand the group
            }
        }

        if(open && onRefreshButton && e.key === 'F5') {
            e.preventDefault();
            onRefreshButton();
        }
    }

    return (
        <div
            className={`dropdown-select ${className || ''}`}
            data-error={error}
            onBlur={() => {
                setTimeout(()=> {
                    if (
                        document.activeElement !== document.body &&
                        !ref.current?.contains(document.activeElement)
                    )
                        close(); // Close the dropdown when it is no longer in focus.
                }, 5);
            }}
            ref={ref}
        >
            { allowCustomValue ? (
                <>
                    <input 
                        type="text" 
                        value={currentValue} 
                        onChange={e=>onChange(e.target.value as T)} 
                        onKeyDown={handleKeys}
                        ref={inputRef}
                        onBlur={(e)=> {
                            setTimeout(()=> {
                                if((ref.current?.contains(document.activeElement) && document.activeElement!==searchBarRef.current) || (document.activeElement===document.body && open)) {
                                    e.target.focus();
                                } 
                                else if(document.activeElement !== document.body) close();
                            }, 10);
                            e.stopPropagation();
                        }}
                    />
                    <button onClick={()=> {inputRef.current?.focus(); openDropDown();}} tabIndex={-1} onKeyDown={handleKeys}>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </button>
                </>
            ) : (
                <button onClick={openDropDown} onKeyDown={handleKeys}>
                    <span className="title">
                        {currentOption ? (currentOption.subtext ? `${currentOption.label} (${currentOption.subtext})` : currentOption.label) : value}
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} />
                </button>
            )}
            <div 
                className={`blur-detector ${open ? 'open' : ''}`} 
                onClick={()=>close()} 
                style={{
                    pointerEvents: open ? blurDetectorPointerEvents : 'none'
                }}
                onWheel={onBlurDetectorWheel}
            />
            <div className={`dropdown ${open ? 'open' : ''}`}>
                {(refreshButton !== undefined) && (
                    <button 
                        className="button refresh" 
                        onClick={onRefreshButton}
                        disabled={refreshButtonActive}
                        tabIndex={-1}
                    >
                        <FontAwesomeIcon icon={faRefresh} spin={refreshButtonActive} className={refreshButtonPulse? 'pulse':''} />
                        {refreshButton}
                    </button>
                )}
                {showSearchBar && (
                    <label className="search-bar">
                        <FontAwesomeIcon icon={faSearch} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            tabIndex={open ? undefined : -1} 
                            value={search}
                            onChange={e=>setSearch(e.target.value)}
                            ref={searchBarRef}
                            onKeyDown={handleKeys}
                        />
                    </label>
                )}
                <div className="items" tabIndex={-1}>
                    {(open||closing) && (
                        options.length? options.filter(o=> {
                            if(!search) {
                                return true;
                            }
                            function searchIn(item: DropDownSelectOption<T>, term: string) {
                                return item.label.toLowerCase().includes(term.toLowerCase()) || (item.subtext?.toLowerCase().includes(term.toLowerCase()));
                            }
                            if(o.isGroup) {
                                return o.children.some(c=>searchIn(c, search));
                            } else {
                                return searchIn(o, search);
                            }
                        }).map((option, index) => {
                            if(option.isGroup) {
                                return (
                                    <SelectGroup<T>
                                        key={option.label}
                                        currentValue={currentValue}
                                        group={option}
                                        onOptionClick={(val)=>{
                                            onChange(val);
                                            close(val);
                                        }}
                                        search={search}
                                        expanded={expandedGroups[index]||false}
                                        setExpanded={v=> setExpandedGroups(s=>({...s, [index]: v}))}
                                        focus={typeof focus === 'number' ? focus===index : focus}
                                    />
                                )
                            } else {
                                return (
                                    <SelectOption<T>
                                        key={option.value}
                                        option={option}
                                        onClick={()=>{
                                            onChange(option.value);
                                            close(option.value);
                                        }}
                                        selected={option.value===currentValue}
                                        search={search}
                                        focus={focus===option.value}
                                    />
                                );
                            }
                        }): children
                    )}
                </div>
            </div>
        </div>
    );
}


