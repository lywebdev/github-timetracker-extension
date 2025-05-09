import './TrackedList.css'

export function TrackedList({ entries }) {
    return (
        <div className="tracked-list">
            {entries.map((entry, i) => (
                <div key={entry.issueUrl || i} className="tracked-entry">
                    <div className="tracked-title">{entry.title}</div>
                    <div className="tracked-meta">
                        {entry.displayTime} {entry.date && `on ${entry.date}`} |{' '}
                        <a href={`https://github.com${entry.issueUrl}`} target="_blank">View</a>
                    </div>
                </div>
            ))}
        </div>
    )
}
