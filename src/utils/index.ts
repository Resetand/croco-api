function isPromise(p: any): p is Promise<any> {
    return !!p && (typeof p === 'object' || typeof p === 'function') && typeof p.then === 'function';
}

type Fallback<T> = ((err: Error) => T) | T;

export function tryCatch<T, E = T>(fn: () => Promise<T>, fallback?: Fallback<Promise<E> | E>): Promise<T | E>;
export function tryCatch<T, E = T>(fn: () => T, fallback?: Fallback<E>): E | T;
export function tryCatch<T, E = T>(
    fn: () => T | Promise<T>,
    fallback: Fallback<E | Promise<E>> = () => undefined!,
): T | E | Promise<T | E> {
    const onFallback = (e: Error) => {
        return fallback instanceof Function ? fallback(e) : fallback;
    };

    try {
        const resOrPromise = fn();
        return isPromise(resOrPromise) ? resOrPromise.catch((e) => onFallback(e)) : resOrPromise;
    } catch (error) {
        return onFallback(error);
    }
}
