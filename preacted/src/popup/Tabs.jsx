import { useState } from 'preact/hooks'
import './Tabs.css'

export function Tabs({ tabs = [], defaultActiveId, tabsHeaderRight = null }) {
    const [activeTab, setActiveTab] = useState(defaultActiveId || tabs[0]?.id)

    const active = tabs.find(tab => tab.id === activeTab)

    return (
        <div className="tabs-container">
            <div className="tabs-wrapper">
                <div class="tabs-bar">
                    {tabs.map(tab => (
                        <span
                            key={tab.id}
                            className={`tab ${tab.id === activeTab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                        {tab.label}
                    </span>
                    ))}
                </div>

                {tabsHeaderRight !== null && tabsHeaderRight}
            </div>
            <div className="tab-content">
                {active?.content}
            </div>
        </div>
    )
}
