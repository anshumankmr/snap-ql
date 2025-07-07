import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { getTableSchema, parseConnectionString } from './db'

export type QueryResponse = {
  query: string
  graphXColumn?: string
  graphYColumns?: string[]
}

export async function generateQuery(
  input: string,
  connectionString: string,
  openAiKey: string,
  existingQuery: string,
  promptExtension: string,
  openAiUrl?: string,
  openAiModel?: string
): Promise<QueryResponse> {
  try {
    const openai = createOpenAI({
      apiKey: openAiKey,
      baseURL: openAiUrl || undefined
    })
    const tableSchema = await getTableSchema(connectionString)
    const existing = existingQuery.trim()

    // Use provided model or default to gpt-4o
    const modelToUse = openAiModel || 'gpt-4o'
    const dbType = parseConnectionString(connectionString)
    if (!dbType) {
      throw new Error('Invalid connection string')
    }

    const systemPrompt = `
      You are a SQL (${dbType}) and data visualization expert. Your job is to help the user write or modify a SQL query to retrieve the data they need. The table schema is as follows:

      ${tableSchema}

      Only retrieval queries are allowed.

      ${existing.length > 0 ? `The user's existing query is: ${existing}` : ``}

      ${promptExtension.length > 0 ? `Extra information: ${promptExtension}` : ``}

      format the query in a way that is easy to read and understand.
      ${dbType === 'postgres' ? 'wrap table names in double quotes' : ''}
      if the query results can be effectively visualized using a graph, specify which column should be used for the x-axis (domain) and which column(s) should be used for the y-axis (range).
    `

    console.log('System prompt: ', systemPrompt)

    const result = await generateObject({
      model: openai(modelToUse),
      system: systemPrompt,
      prompt: input,
      schema: z.object({
        query: z.string(),
        graphXColumn: z.string().optional(),
        graphYColumns: z.array(z.string()).optional()
      }),
      providerOptions: {
        openai: {
          apiKey: openAiKey
        }
      }
    })
    return result.object as QueryResponse
  } catch (e: any) {
    console.error(e)
    throw new Error('Failed to generate query: ' + e.message)
  }
}