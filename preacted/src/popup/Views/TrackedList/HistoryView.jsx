import { useState, useEffect } from 'preact/hooks'
import {TrackedList} from "./TrackedList.jsx";
import {TimeService} from "../../../utils/time.js";

export function HistoryView() {
    const [entries, setEntries] = useState([])

    useEffect(() => {
        chrome.storage.local.get("trackedTimes", (data) => {
            const tracked = (data.trackedTimes || []).slice(-10).reverse()
            const formatted = tracked.map(e => ({
                ...e,
                displayTime: TimeService.formatTime(e.seconds),
            }))
            setEntries(formatted)
        })
    }, [])

    return <TrackedList entries={entries} />
}
