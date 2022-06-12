// Create a unique ID each time it is called
let lastId = 0;
export const uniqueId = (prefix = "") => {
    return `${prefix}${++lastId}`;
}