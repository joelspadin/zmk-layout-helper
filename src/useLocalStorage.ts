import { Dispatch, SetStateAction, useCallback, useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
}

function dispatchEvent(key: string, newValue: string | undefined | null) {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
}

function removeItem(key: string) {
    localStorage.removeItem(key);
    dispatchEvent(key, null);
}

function setItem<T>(key: string, value: T) {
    const newValue = JSON.stringify(value);
    localStorage.setItem(key, newValue);
    dispatchEvent(key, newValue);
}

export function useLocalStorage<T>(key: string): [T | undefined, Dispatch<SetStateAction<T | undefined>>];
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>];

export function useLocalStorage<T>(key: string, initialValue?: T) {
    const store = useSyncExternalStore(subscribe, () => localStorage.getItem(key));

    const state = store === null ? initialValue : (JSON.parse(store) as T);

    const setState: Dispatch<SetStateAction<T | undefined>> = useCallback(
        (value) => {
            const nextState = value instanceof Function ? value(state) : value;

            if (nextState === undefined || nextState === null) {
                removeItem(key);
            } else {
                setItem(key, nextState);
            }
        },
        [key, state],
    );

    return [state, setState];
}
