export function Tabs({ activeTab, setActiveTab }) {
    const tabStyle = {
        cursor: 'pointer',
        marginRight: '10px',
        display: 'inline-block'
    }

    const activeStyle = {
        ...tabStyle,
        fontWeight: 'bold',
        textDecoration: 'underline'
    }

    return (
        <div style={{ margin: '10px 0' }}>
      <span
          style={activeTab === 'summary' ? activeStyle : tabStyle}
          onClick={() => setActiveTab('summary')}
      >
        Summary
      </span>
            <span
                style={activeTab === 'history' ? activeStyle : tabStyle}
                onClick={() => setActiveTab('history')}
            >
        History
      </span>
        </div>
    )
}