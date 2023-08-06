import { HMApi } from "../hub/api";

export default function checkSettingsFieldCondition(
    fields: HMApi.T.SettingsField<false>[],
    fieldId: string,
    fieldValues: Record<string, string | number | boolean>
): boolean {
    const condition = fields.find(f => f.id === fieldId)?.condition;
    if (!condition) return true;

    return checkCondition(condition, fields, fieldValues);
}

function checkCondition(
    condition: HMApi.T.SettingsField.Condition.Condition,
    fields: HMApi.T.SettingsField<false>[],
    fieldValues: Record<string, string | number | boolean>,
): boolean {
    function getExpression(exp: HMApi.T.SettingsField.Condition.Expression): string | number | boolean {
        if (typeof exp === "object") {
            switch (exp.type) {
                case "constant":
                    return exp.constant;
                case "fieldValue":
                    return fieldValues[exp.id];
            }
        } else return exp;
    }

    switch (condition.type) {
        case "compare": {
            const a = getExpression(condition.a), b = getExpression(condition.b);
            switch (condition.op) {
                case "!=": return a !== b;
                case "<": return a < b;
                case "<=": return a <= b;
                case "==": return a === b;
                case ">": return a > b;
                case ">=": return a >= b;
            }
        }
        // eslint-disable-next-line no-fallthrough
        case "fieldVisible":
            return checkSettingsFieldCondition(fields, condition.id, fieldValues);
        case "and":
            return condition.in.every(c => checkCondition(c, fields, fieldValues));
        case "or":
            return condition.in.some(c => checkCondition(c, fields, fieldValues));
        case "not":
            return !checkCondition(condition.in, fields, fieldValues)
    }
}

