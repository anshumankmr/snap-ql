import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('Context isolation must be enabled!')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getConnectionString: async () => await ipcRenderer.invoke('getConnectionString'),
    setConnectionString: async (connectionString: string) =>
      await ipcRenderer.invoke('setConnectionString', connectionString),
    runQuery: async (query: string) => await ipcRenderer.invoke('runQuery', query),
    generateQuery: async (input: string, sqlQuery: string) =>
      await ipcRenderer.invoke('generateQuery', input, sqlQuery),
    getOpenAiKey: async () => await ipcRenderer.invoke('getOpenAiKey'),
    setOpenAiKey: async (openAiKey: string) => await ipcRenderer.invoke('setOpenAiKey', openAiKey),
    getOpenAiBaseUrl: async () => await ipcRenderer.invoke('getOpenAiBaseUrl'),
    setOpenAiBaseUrl: async (openAiBaseUrl: string) =>
      await ipcRenderer.invoke('setOpenAiBaseUrl', openAiBaseUrl),
    getOpenAiModel: async () => await ipcRenderer.invoke('getOpenAiModel'),
    setOpenAiModel: async (openAiModel: string) =>
      await ipcRenderer.invoke('setOpenAiModel', openAiModel),
    getQueryHistory: async () => await ipcRenderer.invoke('getQueryHistory'),
    addQueryToHistory: async (queryEntry: any) =>
      await ipcRenderer.invoke('addQueryToHistory', queryEntry),
    updateQueryHistory: async (queryId: string, updates: any) =>
      await ipcRenderer.invoke('updateQueryHistory', queryId, updates),
    getFavorites: async () => await ipcRenderer.invoke('getFavorites'),
    addFavorite: async (favorite: any) => await ipcRenderer.invoke('addFavorite', favorite),
    removeFavorite: async (favoriteId: string) =>
      await ipcRenderer.invoke('removeFavorite', favoriteId),
    updateFavorite: async (favoriteId: string, updates: any) =>
      await ipcRenderer.invoke('updateFavorite', favoriteId, updates),
    getPromptExtension: async () => await ipcRenderer.invoke('getPromptExtension'),
    setPromptExtension: async (promptExtension: string) =>
      await ipcRenderer.invoke('setPromptExtension', promptExtension),
    getAiProvider: async () => await ipcRenderer.invoke('getAiProvider'),
    setAiProvider: async (aiProvider: 'openai' | 'claude') =>
      await ipcRenderer.invoke('setAiProvider', aiProvider),
    getClaudeApiKey: async () => await ipcRenderer.invoke('getClaudeApiKey'),
    setClaudeApiKey: async (claudeApiKey: string) =>
      await ipcRenderer.invoke('setClaudeApiKey', claudeApiKey),
    getClaudeModel: async () => await ipcRenderer.invoke('getClaudeModel'),
    setClaudeModel: async (claudeModel: string) =>
      await ipcRenderer.invoke('setClaudeModel', claudeModel),

    // Connection management
    createConnection: async (name: string, connectionMetadata: any) =>
      await ipcRenderer.invoke('createConnection', name, connectionMetadata),
    editConnection: async (name: string, connectionMetadata: any) =>
      await ipcRenderer.invoke('editConnection', name, connectionMetadata),
    listConnections: async () => await ipcRenderer.invoke('listConnections'),
    getConnection: async (name: string) => await ipcRenderer.invoke('getConnection', name),
    deleteConnection: async (name: string) => await ipcRenderer.invoke('deleteConnection', name),
    getConnectionHistory: async (name: string) =>
      await ipcRenderer.invoke('getConnectionHistory', name),
    addQueryToConnectionHistory: async (name: string, queryEntry: any) =>
      await ipcRenderer.invoke('addQueryToConnectionHistory', name, queryEntry),
    getConnectionFavorites: async (name: string) =>
      await ipcRenderer.invoke('getConnectionFavorites', name),
    addConnectionFavorite: async (name: string, favorite: any) =>
      await ipcRenderer.invoke('addConnectionFavorite', name, favorite),
    removeConnectionFavorite: async (name: string, favoriteId: string) =>
      await ipcRenderer.invoke('removeConnectionFavorite', name, favoriteId),
    getConnectionPromptExtension: async (name: string) =>
      await ipcRenderer.invoke('getConnectionPromptExtension', name),
    setConnectionPromptExtension: async (name: string, promptExtension: string) =>
      await ipcRenderer.invoke('setConnectionPromptExtension', name, promptExtension),
    runQueryForConnection: async (name: string, query: string) =>
      await ipcRenderer.invoke('runQueryForConnection', name, query),
    generateQueryForConnection: async (name: string, input: string, existingQuery: string) =>
      await ipcRenderer.invoke('generateQueryForConnection', name, input, existingQuery)
  })
} catch (error) {
  console.error(error)
}
