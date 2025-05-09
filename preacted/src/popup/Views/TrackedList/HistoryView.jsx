import { useState, useEffect } from 'preact/hooks'
import { formatTime } from '../../../utils/time.js';
import {TrackedList} from "./TrackedList.jsx";

export function HistoryView() {
    const [entries, setEntries] = useState([])

    useEffect(() => {
        chrome.storage.local.get("trackedTimes", (data) => {
            const tracked = (data.trackedTimes || []).slice(-10).reverse()
            const formatted = tracked.map(e => ({
                ...e,
                displayTime: formatTime(e.seconds),
            }))
            setEntries(formatted)
        })
    }, [])

    return <TrackedList entries={entries} />
}
