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
    getPromptExtension: async () => await ipcRenderer.invoke('getPromptExtension'),
    setPromptExtension: async (promptExtension: string) =>
      await ipcRenderer.invoke('setPromptExtension', promptExtension)
  })
} catch (error) {
  console.error(error)
}
