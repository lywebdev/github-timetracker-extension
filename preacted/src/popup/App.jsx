import { useState, useEffect } from 'preact/hooks'
import { Tabs } from './Tabs'
import { Button } from "../components/Button/Button.jsx"
import { Input } from "../components/Input/Input.jsx"
import { SummaryView } from "./Views/TrackedList/SummaryView.jsx"
import { HistoryView } from "./Views/TrackedList/HistoryView.jsx"

export function App() {
    const [token, setToken] = useState('')
    const [isEditingToken, setIsEditingToken] = useState(false)
    const [isTokenSaved, setIsTokenSaved] = useState(false)

    useEffect(() => {
        chrome.storage.local.get("githubToken", (data) => {
            if (data.githubToken) {
                setToken(data.githubToken)
                setIsTokenSaved(true)
            }
        })
    }, [])

    const saveToken = () => {
        chrome.storage.local.set({ githubToken: token }, () => {
            setIsEditingToken(false)
            setIsTokenSaved(true)
        })
    }

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '10px', width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>⏱️ GitHub Time Tracker</h2>
                {isTokenSaved && (
                    <button
                        onClick={() => setIsEditingToken(!isEditingToken)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                        title="Edit token"
                    >
                        ✏️
                    </button>
                )}
            </div>

            {(!isTokenSaved || isEditingToken) && (
                <>
                    <Input
                        type="password"
                        value={token}
                        onInput={(e) => setToken(e.target.value)}
                        placeholder="GitHub Token"
                    />
                    <Button onClick={saveToken}>Save Token</Button>
                </>
            )}

            <Tabs
                tabs={[
                    { id: 'summary', label: 'Summary', content: <SummaryView /> },
                    { id: 'history', label: 'History', content: <HistoryView /> }
                ]}
            />
        </div>
    )
}
