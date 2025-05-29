import { useState, useEffect } from 'preact/hooks';
import { Tabs } from './Tabs.jsx';
import { Button } from '../components/Button/Button.jsx';
import { Input } from '../components/Input/Input.jsx';
import { Modal } from '../components/Modal/Modal.jsx';
import { SummaryView } from './Views/TrackedList/SummaryView.jsx';
import { HistoryView } from './Views/TrackedList/HistoryView.jsx';
import { GitHubStorageService } from '../utils/github-storage.js';
import { StorageService } from '../utils/storage.js';
import { STORAGE_KEYS } from '../utils/constants.ts';
import {useStorageListener} from "../hooks/useStorageListener.js";
import {IssueStorageService} from "../utils/issue-storage.js";
import './App.css';
import { CalendarView } from "./Views/TrackedList/CalendarView.jsx";

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
      <div className="p-4 box-border w-[400px] font-['Inter',sans-serif]">
          <h4 className="text-center text-lg font-semibold">⏱️ GitHub Time Tracker</h4>

          {!isEditing ? (
            <div className="flex justify-between items-center my-4">
                <span className="text-sm text-gray-600">
                    {token ? '✅' : '❌'} Token: {maskedToken}
                </span>
                <div className="flex gap-2">
                    {token && (
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={removeTokenHandler}
                      >
                        Remove
                      </span>
                    )}
                    <span
                      className="text-blue-600 cursor-pointer hover:underline"
                      onClick={handleEditClick}
                    >
                        Change
                    </span>
                </div>
            </div>
          ) : (
            <div className="my-4">
                <Input
                  type="password"
                  value={token}
                  onInput={(e) => setToken(e.target.value)}
                  placeholder="GitHub Token"
                />
                {tokenStatus && tokenStatus.type === 'error' && (
                  <span className="text-red-500 block mb-2">
                    {tokenStatus.message}
                  </span>
                )}
                <div className="flex gap-2">
                    <Button onClick={handleSaveToken}>Save Token</Button>
                    <Button variant="secondary" onClick={handleCancelClick}>Cancel</Button>
                </div>
            </div>
          )}

          {
            tracked.length > 0 && (
              <div className="flex justify-between items-center">
                  <div className="flex-1">
                      <Tabs
                        tabs={[
                            {id: 'summary', label: 'Summary', content: <SummaryView tracked={tracked}/>},
                            {id: 'history', label: 'History', content: <HistoryView tracked={tracked}/>},
                            {id: 'calendar', label: 'Calendar', content: <CalendarView tracked={tracked}/>},
                        ]}
                        defaultActiveId="summary"
                        tabsHeaderRight={<div
                          onClick={handleClearTrackedTimes}
                          className="text-sm cursor-pointer hover:underline"
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