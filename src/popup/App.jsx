// popup/App.jsx
import { useState, useEffect } from 'preact/hooks';
import { Tabs } from './Tabs.jsx';
import { Button } from '../components/Button/Button.jsx';
import { Input } from '../components/Input/Input.jsx';
import { Modal } from '../components/Modal/Modal.jsx';
import { SummaryView } from './Views/TrackedList/SummaryView.jsx';
import { HistoryView } from './Views/TrackedList/HistoryView.jsx';
import { GitHubStorageService } from '../utils/github-storage.js';
import { StorageService } from '../utils/storage.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import './App.css';
import {useStorageListener} from "../hooks/useStorageListener.js";
import {IssueStorageService} from "../utils/issue-storage.js";

export function App() {
    const NO_TOKEN_TEXT = 'no token';

    const [token, setToken] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [maskedToken, setMaskedToken] = useState(NO_TOKEN_TEXT);
    const [tokenStatus, setTokenStatus] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const tracked = useStorageListener(STORAGE_KEYS.TRACKED_TIMES, []);

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

    const handleClearTrackedTimes = () => {
        setShowClearConfirm(true);
    };

    const confirmClear = async () => {
        try {
            await StorageService.remove(STORAGE_KEYS.TRACKED_TIMES);
            await IssueStorageService.removeAll();
            setShowClearConfirm(false);
        } catch (error) {
            console.error('Failed to clear tracked times:', error);
            setShowClearConfirm(false);
            alert('Failed to clear tracked times. Please try again.');
        }
    };

    const cancelClear = () => {
        setShowClearConfirm(false);
    };

    return (
      <div className='popup'>
          <h2>⏱️ GitHub Time Tracker</h2>

          <h1 className="text-3xl font-bold underline">
              Hello world!
          </h1>

          <input
            type="text"
            placeholder="Enter text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {!isEditing ? (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                marginTop: '15px'
            }}>
                    <span style={{fontSize: '0.9em', color: '#555'}}>
                        {token ? '✅' : '❌'} Token: {maskedToken}
                    </span>
                <div>
                    {token && (
                      <span
                        style={{marginRight: '10px', cursor: 'pointer'}}
                        onClick={removeTokenHandler}
                      >
                                Remove
                            </span>
                    )}
                    <span
                      onClick={handleEditClick}
                      style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}}
                    >
                            Change
                        </span>
                </div>
            </div>
          ) : (
            <div style={{marginBottom: '15px', marginTop: '15px'}}>
                <Input
                  type="password"
                  value={token}
                  onInput={(e) => setToken(e.target.value)}
                  placeholder="GitHub Token"
                />
                {tokenStatus && tokenStatus.type === 'error' && (
                  <span style={{color: 'red', marginBottom: '10px', display: 'inline-block'}}>
                            {tokenStatus.message}
                        </span>
                )}
                <div style={{display: 'flex', gap: '10px'}}>
                    <Button onClick={handleSaveToken}>Save Token</Button>
                    <Button variant="secondary" onClick={handleCancelClick}>Cancel</Button>
                </div>
            </div>
          )}

          {
            tracked.length > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{flex: 1}}>
                      <Tabs
                        tabs={[
                            {id: 'summary', label: 'Summary', content: <SummaryView tracked={tracked}/>},
                            {id: 'history', label: 'History', content: <HistoryView tracked={tracked}/>}
                        ]}
                        tabsHeaderRight={<div
                          onClick={handleClearTrackedTimes}
                          className='clearTrackedTimesBtn'
                        >
                            Clear
                        </div>}
                      />
                  </div>
              </div>)
          }

          {showClearConfirm && (
            <Modal
              title="Confirm Clear"
              message="Are you sure you want to clear all tracked times? This action cannot be undone."
              onConfirm={confirmClear}
              onCancel={cancelClear}
            />
          )}
      </div>
    );
}