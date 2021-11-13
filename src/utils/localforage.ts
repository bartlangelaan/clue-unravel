import { useCallback, useEffect, useState } from 'react';
import localforage from 'localforage';

export function useLocalItem<T>(key: string, fallback: T) {
    const [state, setState] = useState<T>(fallback);

    const fetchLatest = useCallback(() => {
        localforage.getItem<T>(key).then(answer => {
            setState(null === answer ? fallback : answer)
        });
    }, [key, fallback]);

    useEffect(() => {
        fetchLatest();
    }, [fetchLatest])
    

    const setLocalItem = useCallback((value: T) => {
        localforage.setItem(key, value).then(() => fetchLatest());
    }, [fetchLatest, key]);

    return [state as T, setLocalItem] as const;
}