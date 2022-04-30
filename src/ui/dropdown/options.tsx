import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import SearchKeywordHighlight from '../search-highlight';
import { DropDownSelectOption, DropDownSelectGroup } from './dropdown';

type DropDownSelectOptionProps<T extends string> = {
    option: DropDownSelectOption<T>;
    onClick: () => void;
    selected: boolean;
    search?: string;
    focus: boolean;
};
export function SelectOption<T extends string>({ option, onClick, selected, search, focus }: DropDownSelectOptionProps<T>) {
    return (
        <div key={option.value}
            className={`item ${selected ? 'selected' : ''} ${focus ? 'focus' : ''}`}
            onClick={onClick}>
            <span className="label">
                <SearchKeywordHighlight term={search}>{option.label}</SearchKeywordHighlight>
            </span>
            {option.subtext && (
                <span className="subtext">
                    <SearchKeywordHighlight term={search}>{option.subtext}</SearchKeywordHighlight>
                </span>
            )}
        </div>
    );
}
type DropDownSelectGroupProps<T extends string> = {
    group: DropDownSelectGroup<T>;
    onOptionClick: (option: T) => void;
    currentValue: T;
    search?: string;
    expanded: boolean;
    setExpanded: (value: boolean) => void;
    focus: boolean | string; // boolean for the group itself, string for a child
};
export function SelectGroup<T extends string>({ group, currentValue, onOptionClick, search, expanded, setExpanded, focus }: DropDownSelectGroupProps<T>) {
    return (
        <div className="group">
            <div className={`item ${focus === true ? 'focus' : ''}`} onClick={() => {
                setExpanded(!expanded);
            }}>
                <FontAwesomeIcon icon={faChevronDown} className={expanded ? 'open' : ''} />
                <span className="label">{group.label}</span>
                {group.subtext && (
                    <span className="subtext">{group.subtext}</span>
                )}
            </div>
            {expanded && (
                <div className="items">
                    {group.children.filter(o => {
                        if (!search) {
                            return true;
                        }
                        return o.label.toLowerCase().includes(search.toLowerCase()) || (o.subtext?.toLowerCase().includes(search.toLowerCase()));
                    }).map(option => (
                        <SelectOption
                            key={option.value}
                            option={option}
                            onClick={() => onOptionClick(option.value)}
                            selected={option.value === currentValue}
                            search={search}
                            focus={typeof focus === 'boolean' ? false : option.value === focus} />
                    ))}
                </div>
            )}
        </div>
    );
}
