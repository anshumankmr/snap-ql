declare global {
  interface Window {
    context: {
      locale: string
      getConnectionString: () => Promise<string>
      setConnectionString: (connectionString: string) => Promise<boolean>
      runQuery: (query: string) => Promise<{ error: string | null; data: any }>
      generateQuery: (
        input: string,
        sqlQuery: string
      ) => Promise<{ error: string | null; data: string }>
      getOpenAiKey: () => Promise<string>
      setOpenAiKey: (openAiKey: string) => Promise<boolean>
      getOpenAiBaseUrl: () => Promise<string>
      setOpenAiBaseUrl: (openAiBaseUrl: string) => Promise<boolean>
      getOpenAiModel: () => Promise<string>
      setOpenAiModel: (openAiModel: string) => Promise<boolean>
      getQueryHistory: () => Promise<any[]>
      addQueryToHistory: (queryEntry: any) => Promise<boolean>
      getPromptExtension: () => Promise<string>
      setPromptExtension: (promptExtension: string) => Promise<boolean>
    }
  }
}

export {}
