import { useState, useEffect } from 'preact/hooks'
import { formatTime } from '../../../utils/time.js';
import {TrackedList} from "./TrackedList.jsx";

export function SummaryView() {
    const [entries, setEntries] = useState([])

    useEffect(() => {
        chrome.storage.local.get("trackedTimes", (data) => {
            const tracked = data.trackedTimes || []
            const grouped = tracked.reduce((acc, entry) => {
                if (!acc[entry.issueUrl]) {
                    acc[entry.issueUrl] = { title: entry.title, seconds: 0, issueUrl: entry.issueUrl }
                }
                acc[entry.issueUrl].seconds += entry.seconds
                return acc
            }, {})

            const formatted = Object.values(grouped).map(e => ({
                ...e,
                displayTime: formatTime(e.seconds),
            }))

            setEntries(formatted)
        })
    }, [])

    return <TrackedList entries={entries} />
}
