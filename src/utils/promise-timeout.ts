/**
 * Calls the specified callback if a promise takes longer than the specified time to complete
 */
export default function promiseTimeout<T>(promise: Promise<T>, timeout: number, callback: ()=>void): Promise<T> {
    let hasCompleted = false;
    setTimeout(()=> {
        if(!hasCompleted) {
            callback();
        }
    }, timeout);
    return new Promise((resolve, reject)=> {
        promise.then((res)=> {
            hasCompleted = true;
            resolve(res);
        }, (err)=> {
            hasCompleted = true;
            reject(err);
        })
    })
}

/**
 * Promisified version of `setTimeout`
 */
export function delay(time: number) {
    return new Promise<void>(resolve=> {
        window.setTimeout(()=> {
            resolve();
        }, time)
    })
}