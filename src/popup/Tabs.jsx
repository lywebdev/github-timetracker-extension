import { useState } from 'preact/hooks'

export function Tabs({ tabs = [], defaultActiveId, tabsHeaderRight = null }) {
  const [activeTab, setActiveTab] = useState(defaultActiveId || tabs[0]?.id)

  const active = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="text-gray-900">
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <span
              key={tab.id}
              className={`cursor-pointer text-sm py-1 px-2 rounded-md transition-colors duration-200 ${tab.id === activeTab ? 'bg-gray-200/50' : ''} hover:bg-gray-200/50`}
              onClick={() => setActiveTab(tab.id)}
            >
                            {tab.label}
                        </span>
          ))}
        </div>
        {tabsHeaderRight}
      </div>
      <div className="mt-2">
        {active?.content}
      </div>
    </div>
  )
}