import { useState, useEffect } from 'preact/hooks'
import { formatTime } from '../utils/time'

export function HistoryView() {
    const [trackedTimes, setTrackedTimes] = useState([])

    useEffect(() => {
        chrome.storage.local.get("trackedTimes", (data) => {
            const tracked = (data.trackedTimes || []).slice(-10).reverse()
            setTrackedTimes(tracked)
        })
    }, [])

    return (
        <div>
            {trackedTimes.map((entry, i) => (
                <div key={i} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                    <div style={{ fontWeight: 'bold' }}>{entry.title}</div>
                    <div style={{ fontSize: '0.9em', color: '#555' }}>
                        {formatTime(entry.seconds)} on {entry.date} | <a href={`https://github.com${entry.issueUrl}`} target="_blank">View</a>
                    </div>
                </div>
            ))}
        </div>
    )
}