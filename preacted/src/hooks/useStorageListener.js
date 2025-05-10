import { useState, useEffect } from 'preact/hooks';
import { StorageService } from '../utils/storage';

export function useStorageListener(key, initialValue = null) {
    const [data, setData] = useState(initialValue);

    useEffect(() => {
        const fetchData = async () => {
            const value = (await StorageService.get(key)) || initialValue;
            setData(value);
        };

        fetchData();

        const listener = (changes, area) => {
            if (area === 'local' && changes[key]) {
                setData(changes[key].newValue || initialValue);
            }
        };
        chrome.storage.onChanged.addListener(listener);

        return () => chrome.storage.onChanged.removeListener(listener);
    }, [key, initialValue]);

    return data;
}