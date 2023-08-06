import { DropDownSelectOption, DropDownSelectGroup } from './dropdown';


type Options<T extends string> = (DropDownSelectOption<T> | DropDownSelectGroup<T>)[];

/**
 * Finds an option in the list and returns it.
 * @param options The list of options
 * @param value The value of the option
 * @returns The option, undefined if not found
 */
export function searchInDropdownOptions<T extends string>(options: Options<T>, value: T): DropDownSelectOption<T> | undefined {
    for (const option of options) {
        if (option.isGroup) {
            const found = searchInDropdownOptions(option.children, value);
            if (found) {
                return found;
            }
        }
        else if (option.value === value) {
            return option;
        }
    }
}

/**
 * Finds an option in the list and returns its index.
 * @param options The list of options
 * @param value The value of the option
 * @returns If it was found as a top level option, returns the index of the option.
 *          If it was found as a child of a group, returns an array of the index of the group and the index of the option within the group.
 *          If it was not found, returns undefined.
 */
export function findOption<T extends string>(options: Options<T>, value: T): number | [number, number] | undefined {
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.isGroup) {
            for (let j = 0; j < option.children.length; j++) {
                if (option.children[j].value === value) {
                    return [i, j];
                }
            }
        }
        else if (option.value === value) {
            return i;
        }
    }
}
