import { HMApi } from "../hub/api";

export default function getFlatFields(fields: HMApi.T.SettingsField[]): HMApi.T.SettingsField<false>[] {
    const result: HMApi.T.SettingsField<false>[] = [];

    for(const field of fields) {
        if(field.type === 'horizontal_wrapper') {
            for(const col of field.columns) {
                getFlatFields(col.fields).forEach(f => result.push(f));
            }
        } 
        else if(field.type === 'container') {
            getFlatFields(field.children).forEach(f => result.push(f));
        }
        else {
            result.push(field)
        }
    }

    return result
}