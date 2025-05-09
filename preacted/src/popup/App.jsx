import { useState, useEffect } from 'preact/hooks'
import { Tabs } from './Tabs'
import { SummaryView } from './SummaryView'
import { HistoryView } from './HistoryView'
import {Button} from "../components/Button.jsx";

export function App() {
    const [activeTab, setActiveTab] = useState('summary')
    const [token, setToken] = useState('')

    useEffect(() => {
        chrome.storage.local.get("githubToken", (data) => {
            if (data.githubToken) setToken(data.githubToken)
        })
    }, [])

    const saveToken = () => {
        chrome.storage.local.set({ githubToken: token })
    }

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '10px', width: '300px' }}>
            <h2>⏱️ GitHub Time Tracker</h2>
            <input
                type="password"
                value={token}
                onInput={(e) => setToken(e.target.value)}
                placeholder="GitHub Token"
                style={{ width: '100%', marginBottom: '8px' }}
            />
            <Button onClick={saveToken}>Save Token</Button>

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === 'summary' ? <SummaryView /> : <HistoryView />}
        </div>
    )
}