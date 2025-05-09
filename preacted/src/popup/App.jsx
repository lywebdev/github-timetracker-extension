import { useState, useEffect } from 'preact/hooks';
import { Tabs } from './Tabs';
import { Button } from '../components/Button/Button.jsx';
import { Input } from '../components/Input/Input.jsx';
import { SummaryView } from './Views/TrackedList/SummaryView.jsx';
import { HistoryView } from './Views/TrackedList/HistoryView.jsx';
import { GitHubStorageService } from '../utils/github-storage';

export function App() {
    const NO_TOKEN_TEXT = 'no token';

    const [token, setToken] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [maskedToken, setMaskedToken] = useState(NO_TOKEN_TEXT);
    const [tokenStatus, setTokenStatus] = useState(null);

    useEffect(() => {
        const loadToken = async () => {
            const savedToken = await GitHubStorageService.getGitHubToken();
            if (savedToken) {
                setToken(savedToken);
                setMaskedToken(savedToken.slice(0, 4) + '••••••••');
            }
        };
        loadToken();
    }, []);

    const handleSaveToken = async () => {
        const isValid = await GitHubStorageService.validateGitHubToken(token);
        if (isValid) {
            await GitHubStorageService.setGitHubToken(token);
            setMaskedToken(token.slice(0, 4) + '••••••••');
            setIsEditing(false);
            setTokenStatus(null);
        } else {
            setTokenStatus({
                type: 'error',
                message: 'Invalid token'
            });
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setTokenStatus(null);
    };

    const removeTokenHandler = async () => {
        await GitHubStorageService.removeGitHubToken();
        setMaskedToken(NO_TOKEN_TEXT);
        setToken('');
    };

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '10px', width: '300px' }}>
            <h2>⏱️ GitHub Time Tracker</h2>

            {!isEditing ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9em', color: '#555' }}>
                        {token ? '✅' : '❌'} Token: {maskedToken}
                    </span>
                    <div>
                        {token && (
                            <span
                                style={{ marginRight: '10px', cursor: 'pointer' }}
                                onClick={removeTokenHandler}
                            >
                                Remove
                            </span>
                        )}
                        <span
                            onClick={handleEditClick}
                            style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Change
                        </span>
                    </div>
                </div>
            ) : (
                <>
                    <Input
                        type="password"
                        value={token}
                        onInput={(e) => setToken(e.target.value)}
                        placeholder="GitHub Token"
                    />
                    {tokenStatus && tokenStatus.type === 'error' && (
                        <span style={{ color: 'red', marginBottom: '10px', display: 'inline-block' }}>
                            {tokenStatus.message}
                        </span>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button onClick={handleSaveToken}>Save Token</Button>
                        <Button variant="secondary" onClick={handleCancelClick}>Cancel</Button>
                    </div>
                </>
            )}

            <Tabs
                tabs={[
                    { id: 'summary', label: 'Summary', content: <SummaryView /> },
                    { id: 'history', label: 'History', content: <HistoryView /> }
                ]}
            />
        </div>
    );
}