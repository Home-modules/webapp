import { DependencyList, useEffect } from "react";

export default function useGlobalEventListener<K extends keyof WindowEventMap>(
    type: K, 
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    deps: DependencyList,
    options?: boolean | AddEventListenerOptions
): void {
    useEffect(() => {
        window.addEventListener(type, listener, options);
        return () => window.removeEventListener(type, listener, options);
    }, [...deps, type, options])
}