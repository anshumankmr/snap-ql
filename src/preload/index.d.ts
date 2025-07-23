export type QueryResponse = {
  query: string
  graphXColumn?: string
  graphYColumns?: string[]
}

declare global {
  interface Window {
    context: {
      locale: string
      // AI Provider settings
      getOpenAiKey: () => Promise<string>
      setOpenAiKey: (openAiKey: string) => Promise<void>
      getOpenAiBaseUrl: () => Promise<string>
      setOpenAiBaseUrl: (openAiBaseUrl: string) => Promise<void>
      getOpenAiModel: () => Promise<string>
      setOpenAiModel: (openAiModel: string) => Promise<void>
      getAiProvider: () => Promise<'openai' | 'claude' | 'ollama'>
      setAiProvider: (aiProvider: 'openai' | 'claude' | 'ollama') => Promise<void>
      getClaudeApiKey: () => Promise<string>
      setClaudeApiKey: (claudeApiKey: string) => Promise<void>
      getClaudeModel: () => Promise<string>
      setClaudeModel: (claudeModel: string) => Promise<void>
      getOllamaBaseUrl: () => Promise<string>
      setOllamaBaseUrl: (ollamaBaseUrl: string) => Promise<void>
      getOllamaModel: () => Promise<string>
      setOllamaModel: (ollamaModel: string) => Promise<void>
      // Add missing Ollama-related functions
      getOllamaModels: () => Promise<{ success: boolean; models: any[]; error?: string }>
      testOllamaConnection: (baseUrl: string) => Promise<{ success: boolean; error?: string }>

      // Connection management
      createConnection: (name: string, connectionMetadata: any) => Promise<void>
      editConnection: (name: string, connectionMetadata: any) => Promise<void>
      listConnections: () => Promise<string[]>
      getConnection: (name: string) => Promise<any>
      deleteConnection: (name: string) => Promise<void>
      getConnectionHistory: (name: string) => Promise<any[]>
      addQueryToConnectionHistory: (name: string, queryEntry: any) => Promise<boolean>
      updateConnectionHistory: (name: string, queryId: string, updates: any) => Promise<boolean>
      getConnectionFavorites: (name: string) => Promise<any[]>
      addConnectionFavorite: (name: string, favorite: any) => Promise<boolean>
      removeConnectionFavorite: (name: string, favoriteId: string) => Promise<boolean>
      updateConnectionFavorite: (name: string, favoriteId: string, updates: any) => Promise<boolean>
      getConnectionPromptExtension: (name: string) => Promise<string>
      setConnectionPromptExtension: (name: string, promptExtension: string) => Promise<boolean>
      runQueryForConnection: (
        name: string,
        query: string
      ) => Promise<{ error: string | null; data: any }>
      generateQueryForConnection: (
        name: string,
        input: string,
        existingQuery: string
      ) => Promise<{ error: string | null; data: QueryResponse }>
      testConnectionString: (
        connectionString: string
      ) => Promise<{ success: boolean; error?: string }>
      getDatabaseSchema: (connectionName: string) => Promise<{ error: string | null; data: any }>
      getConnectionDatabaseType: (connectionName: string) => Promise<'postgres' | 'mysql' | null>
    }
  }
}

export {}
