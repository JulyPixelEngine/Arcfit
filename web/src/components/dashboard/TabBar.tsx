"use client"

export interface Tab {
  id: string
  title: string
  closable: boolean
}

interface TabBarProps {
  tabs: Tab[]
  activeId: string
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onCloseAll: () => void
}

function IconX() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function TabBar({ tabs, activeId, onSwitch, onClose, onCloseAll }: TabBarProps) {
  const closableTabs = tabs.filter((t) => t.closable)

  return (
    <div className="flex items-center border-b border-gray-200 bg-white px-2 min-h-[42px] overflow-x-auto">
      {/* Tabs */}
      <div className="flex items-stretch gap-0.5 flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              onClick={() => onSwitch(tab.id)}
              className={`group relative flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] whitespace-nowrap transition-colors rounded-t ${
                isActive
                  ? "text-[#2563eb] bg-gray-50"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.title}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563eb] rounded-t" />
              )}
              {tab.closable && (
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); onClose(tab.id) }}
                  className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                    isActive
                      ? "text-[#2563eb] hover:bg-blue-100"
                      : "text-gray-300 group-hover:text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <IconX />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Close All */}
      {closableTabs.length > 0 && (
        <button
          onClick={onCloseAll}
          className="shrink-0 ml-2 px-2.5 py-1 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors whitespace-nowrap"
        >
          Close All
        </button>
      )}
    </div>
  )
}
