import { useState, useEffect } from 'preact/hooks'
import { formatTime } from '../utils/time'

export function SummaryView() {
    const [trackedTimes, setTrackedTimes] = useState([])

    useEffect(() => {
        chrome.storage.local.get("trackedTimes", (data) => {
            const tracked = data.trackedTimes || []
            const grouped = tracked.reduce((acc, entry) => {
                if (!acc[entry.issueUrl]) {
                    acc[entry.issueUrl] = { title: entry.title, seconds: 0 }
                }
                acc[entry.issueUrl].seconds += entry.seconds
                return acc
            }, {})
            setTrackedTimes(Object.entries(grouped))
        })
    }, [])

    return (
        <div>
            {trackedTimes.map(([url, entry]) => (
                <div key={url} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                    <div style={{ fontWeight: 'bold' }}>{entry.title}</div>
                    <div style={{ fontSize: '0.9em', color: '#555' }}>
                        {formatTime(entry.seconds)} | <a href={`https://github.com${url}`} target="_blank">View</a>
                    </div>
                </div>
            ))}
        </div>
    )
}