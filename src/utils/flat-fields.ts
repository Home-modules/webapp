import { HMApi } from "../comms/api";

export default function getFlatFields(fields: HMApi.SettingsField[]): HMApi.SettingsFieldWithoutContainer[] {
    const result: HMApi.SettingsFieldWithoutContainer[] = [];

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