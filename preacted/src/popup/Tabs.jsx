import './Tabs.css'

export function Tabs({ activeTab, setActiveTab }) {
    return (
        <div className="tabs-wrapper">
      <span
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
      >
        Summary
      </span>
            <span
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
            >
        History
      </span>
        </div>
    )
}
