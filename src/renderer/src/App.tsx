import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { SQLEditor } from './components/SQLEditor'
import { ResultsTable } from './components/ResultsTable'
import { AIChat } from './components/AIChat'
import { Settings } from './components/Settings'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'
import { Button } from './components/ui/button'
import { ThemeProvider } from './components/ui/theme-provider'
import { Graph } from './components/Graph'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { BarChart3, Table } from 'lucide-react'

interface QueryHistory {
  id: string
  query: string
  results: any[]
  graph?: GraphMetadata // past: graphMetadata
  timestamp: Date
}

type GraphMetadata = {
  graphXColumn: string
  graphYColumns: string[]
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'editor' | 'settings'>('editor')
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM information_schema.tables;')
  const [graphMetadata, setGraphMetadata] = useState<GraphMetadata | null>(null)
  const [queryResults, setQueryResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([])
  const [favorites, setFavorites] = useState<QueryHistory[]>([])
  const [currentItemId, setCurrentItemId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'visualize' | 'results'>('results')

  const { toast } = useToast()

  const graphableData = queryResults.slice(0, 10000) // limit to 10k rows for performance

  // Load connections on startup and set default connection
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const connectionList = await window.context.listConnections()

        // Set first connection as default if no connection is selected
        if (connectionList.length > 0 && !selectedConnection) {
          setSelectedConnection(connectionList[0])
        }
      } catch (error) {
        console.error('Failed to load connections:', error)
      }
    }
    loadConnections()
  }, [selectedConnection])

  // Load connection-specific history and favorites when connection changes
  useEffect(() => {
    const loadConnectionData = async () => {
      if (!selectedConnection) {
        setQueryHistory([])
        setFavorites([])
        return
      }

      try {
        const [history, favoritesData] = await Promise.all([
          window.context.getConnectionHistory(selectedConnection),
          window.context.getConnectionFavorites(selectedConnection)
        ])

        // Convert timestamp strings back to Date objects
        const historyWithDates = history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setQueryHistory(historyWithDates)

        const favoritesWithDates = favoritesData.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setFavorites(favoritesWithDates)
      } catch (error) {
        console.error('Failed to load connection data:', error)
      }
    }
    loadConnectionData()
  }, [selectedConnection])

  const runQuery = async (query: string) => {
    if (!selectedConnection) {
      setError('No connection selected')
      return
    }

    setIsLoading(true)
    try {
      const res = await window.context.runQueryForConnection(selectedConnection, query)
      if (res.error) {
        setError(res.error)
        setQueryResults([])
      } else {
        setQueryResults(res.data)
        setError(null)
        toast({
          title: 'Query executed successfully',
          description: 'You can ask the AI to fine tune the query',
          duration: 1500
        })

        // Check if the currently selected item is a favorite
        const currentFavorite = currentItemId
          ? favorites.find((fav) => fav.id === currentItemId)
          : null

        if (currentFavorite) {
          // Update the favorite with new results and timestamp
          const updatedFavorite = {
            ...currentFavorite,
            results: res.data,
            query: query,
            timestamp: new Date(),
            graph: graphMetadata ?? undefined
          }

          // Update local favorites state
          setFavorites((prev) =>
            prev.map((fav) => (fav.id === currentFavorite.id ? updatedFavorite : fav))
          )

          // Persist favorite update to storage
          try {
            const favoriteEntryForStorage = {
              ...updatedFavorite,
              timestamp: updatedFavorite.timestamp.toISOString()
            }
            await window.context.updateConnectionFavorite(
              selectedConnection,
              currentFavorite.id,
              favoriteEntryForStorage
            )
          } catch (error) {
            console.error('Failed to update favorite:', error)
          }
        }

        // Always add to history (whether it's a favorite or not)
        const historyEntry: QueryHistory = {
          id: Date.now().toString(),
          query: query,
          results: res.data,
          graph: graphMetadata ?? undefined,
          timestamp: new Date()
        }

        // Update local state
        setQueryHistory((prev) => [historyEntry, ...prev.slice(0, 19)]) // Keep last 20 queries

        // If we updated a favorite, keep the favorite ID as current, otherwise use the new history entry ID
        if (!currentFavorite) {
          setCurrentItemId(historyEntry.id)
        }

        // Persist to storage
        try {
          const historyEntryForStorage = {
            ...historyEntry,
            timestamp: historyEntry.timestamp.toISOString() // Convert Date to string for storage
          }
          await window.context.addQueryToConnectionHistory(
            selectedConnection,
            historyEntryForStorage
          )
        } catch (error) {
          console.error('Failed to save query to history:', error)
        }
      }
    } catch (error: any) {
      console.error('Query execution failed:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIQuery = async (userQuery: string) => {
    if (!selectedConnection) {
      setError('No connection selected')
      return
    }

    setIsGenerating(true)
    setGraphMetadata(null)
    toast({
      title: 'Generating query...',
      description: 'The query is being generated...',
      duration: 1500
    })
    try {
      const res = await window.context.generateQueryForConnection(
        selectedConnection,
        userQuery,
        sqlQuery ?? ''
      )
      if (res.error) {
        setError(res.error)
      } else {
        setSqlQuery(res.data.query)
        if (res.data.graphXColumn && res.data.graphYColumns && res.data.graphYColumns.length > 0) {
          setGraphMetadata({
            graphXColumn: res.data.graphXColumn,
            graphYColumns: res.data.graphYColumns
          })
        }
        toast({
          title: 'Query generated!',
          description: 'The query was generated successfully',
          duration: 1500,
          action: <Button onClick={() => runQuery(res.data.query)}>Run!</Button>
        })
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleItemSelect = (item: QueryHistory) => {
    setSqlQuery(item.query)
    setQueryResults(item.results)
    setGraphMetadata(item.graph ?? null)
    setCurrentItemId(item.id)
    // Set active tab based on whether the item has a graph
    setActiveTab(item.graph ? 'visualize' : 'results')
  }

  const handleGraphMetadataChange = async (newMetadata: GraphMetadata) => {
    setGraphMetadata(newMetadata)

    // Switch to visualize tab when graph is created
    setActiveTab('visualize')

    // Update the current item if one is selected
    if (currentItemId) {
      // Check if it's a favorite first
      const isFavorite = favorites.some((fav) => fav.id === currentItemId)

      if (isFavorite) {
        await handleFavoriteMetadataChange(currentItemId, newMetadata)
      } else {
        // Update local history state
        setQueryHistory((prev) =>
          prev.map((item) => (item.id === currentItemId ? { ...item, graph: newMetadata } : item))
        )

        // Persist to storage
        try {
          await window.context.updateConnectionHistory(selectedConnection!, currentItemId, {
            graph: newMetadata
          })
        } catch (error) {
          console.error('Failed to update query history:', error)
        }
      }
    }
  }

  const handleAddToFavorites = async (historyItem: QueryHistory) => {
    if (!selectedConnection) {
      console.error('No connection selected')
      return
    }

    try {
      const favoriteEntry = {
        ...historyItem,
        timestamp: historyItem.timestamp.toISOString()
      }
      await window.context.addConnectionFavorite(selectedConnection, favoriteEntry)

      // Update local favorites state
      setFavorites((prev) => [historyItem, ...prev])
    } catch (error) {
      console.error('Failed to add to favorites:', error)
    }
  }

  const handleRemoveFromFavorites = async (favoriteId: string) => {
    if (!selectedConnection) {
      console.error('No connection selected')
      return
    }

    try {
      await window.context.removeConnectionFavorite(selectedConnection, favoriteId)

      // Update local favorites state
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
    } catch (error) {
      console.error('Failed to remove from favorites:', error)
    }
  }

  const handleFavoriteMetadataChange = async (favoriteId: string, newMetadata: GraphMetadata) => {
    if (!selectedConnection) {
      console.error('No connection selected')
      return
    }

    // Update current state if this is the active item
    if (currentItemId === favoriteId) {
      setGraphMetadata(newMetadata)
    }

    // Update local favorites state
    setFavorites((prev) =>
      prev.map((item) => (item.id === favoriteId ? { ...item, graph: newMetadata } : item))
    )

    // Persist to storage
    try {
      await window.context.updateConnectionFavorite(selectedConnection, favoriteId, {
        graph: newMetadata
      })
    } catch (error) {
      console.error('Failed to update favorite:', error)
    }
  }

  const handleConnectionSelect = (connectionName: string | null) => {
    setSelectedConnection(connectionName)
    setCurrentView('editor') // Switch to editor view when selecting a connection

    // Clear the editor state when switching connections
    setSqlQuery('SELECT * FROM information_schema.tables;')
    setQueryResults([])
    setGraphMetadata(null)
    setCurrentItemId(null)
    setError(null)
  }

  const handleNewQuery = () => {
    setSqlQuery('SELECT * FROM information_schema.tables;')
    setQueryResults([])
    setGraphMetadata(null)
    setCurrentItemId(null)
    setError(null)
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="h-screen bg-background flex overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            queryHistory={queryHistory}
            favorites={favorites}
            onItemSelect={handleItemSelect}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            selectedConnection={selectedConnection}
            onConnectionSelect={handleConnectionSelect}
            onNewQuery={handleNewQuery}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {currentView === 'editor' ? (
            <>
              {/* AI Chat Header - Only in editor view */}
              <div className="border-b bg-card p-3 flex-shrink-0">
                <AIChat onUserQuery={handleAIQuery} isGenerating={isGenerating} />
              </div>

              {/* Main Content - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-3">
                  {selectedConnection ? (
                    <div className="space-y-3">
                      <div>
                        <SQLEditor
                          value={sqlQuery}
                          onChange={setSqlQuery}
                          onRun={() => runQuery(sqlQuery)}
                          isLoading={isLoading}
                        />
                      </div>
                      {error && <div className="text-red-500">{error}</div>}

                      {/* Tabs for Graph and Results */}
                      {queryResults.length > 0 && (
                        <Tabs
                          value={graphMetadata ? activeTab : 'results'}
                          onValueChange={(value) => setActiveTab(value as 'visualize' | 'results')}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            {graphMetadata && (
                              <TabsTrigger value="visualize" className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Visualize
                              </TabsTrigger>
                            )}
                            <TabsTrigger
                              value="results"
                              className={graphMetadata ? '' : 'col-span-2'}
                            >
                              <Table className="w-4 h-4 mr-2" />
                              Results
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="visualize">
                            {graphMetadata ? (
                              <Graph
                                data={graphableData}
                                graphMetadata={graphMetadata}
                                onMetadataChange={handleGraphMetadataChange}
                              />
                            ) : (
                              <ResultsTable
                                results={queryResults}
                                isLoading={isLoading}
                                query={sqlQuery}
                                graphMetadata={graphMetadata}
                                onCreateGraph={handleGraphMetadataChange}
                              />
                            )}
                          </TabsContent>

                          <TabsContent value="results">
                            <ResultsTable
                              results={queryResults}
                              isLoading={isLoading}
                              query={sqlQuery}
                              graphMetadata={graphMetadata}
                              onCreateGraph={handleGraphMetadataChange}
                            />
                          </TabsContent>
                        </Tabs>
                      )}

                      {/* Show Results Table without tabs when no results */}
                      {queryResults.length === 0 && (
                        <ResultsTable
                          results={queryResults}
                          isLoading={isLoading}
                          query={sqlQuery}
                          graphMetadata={graphMetadata}
                          onCreateGraph={handleGraphMetadataChange}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">No Connection Selected</h2>
                        <p className="text-muted-foreground">
                          Please select a connection from the sidebar to start querying your
                          database.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Settings view - no AI Chat */
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-3">
                <Settings />
              </div>
            </div>
          )}
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default Index
