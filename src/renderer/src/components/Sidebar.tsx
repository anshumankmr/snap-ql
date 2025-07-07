import { Database, Settings as SettingsIcon, Code, History, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface QueryHistory {
  id: string
  query: string
  results: any[]
  timestamp: Date
}

interface SidebarProps {
  currentView: 'editor' | 'settings'
  onViewChange: (view: 'editor' | 'settings') => void
  queryHistory: QueryHistory[]
  onHistorySelect: (historyItem: QueryHistory) => void
}

export const Sidebar = ({
  currentView,
  onViewChange,
  queryHistory,
  onHistorySelect
}: SidebarProps) => {
  const menuItems = [
    {
      id: 'editor' as const,
      label: 'Query Editor',
      icon: Code
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: SettingsIcon
    }
  ]

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const truncateQuery = (query: string, maxLength: number = 40) => {
    return query.length > maxLength ? query.substring(0, maxLength) + '...' : query
  }

  return (
    <div className="w-56 bg-card border-r border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-primary" />
          <h1 className="text-sm font-semibold">SnapQL</h1>
          <p className="text-xs text-muted-foreground">beta 0.01</p>
        </div>
      </div>

      <nav className="p-2 border-b border-border">
        <ul className="space-y-0.5">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                  currentView === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-2 border-b border-border">
          <div className="flex items-center space-x-2">
            <History className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Query History</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {queryHistory.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">No queries yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {queryHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onHistorySelect(item)}
                    className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-foreground line-clamp-2 leading-3">
                        {truncateQuery(item.query)}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimestamp(item.timestamp)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          • {item.results.length} rows
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
