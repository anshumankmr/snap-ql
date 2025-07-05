import pg from 'pg'
import mysql from 'mysql'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

// check if it is a valid postgres or mysql connection string. testing only the first part of the connection string.
// e.g.:
// mysql:  mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700
// postgres: postgres://postgres:123456@127.0.0.1:5432/dummy
function parseConnectionString(connectionString: string): 'postgres' | 'mysql' | null {
  // split by // and check if the first part is postgres or mysql
  const parts = connectionString.split('//')
  if (parts.length > 0) {
    const firstPart = parts[0]
    if (firstPart.includes('postgres')) {
      return 'postgres'
    }
    if (firstPart.includes('mysql')) {
      return 'mysql'
    }
  }
  return null
}

export async function testConnectionString(connectionString: string): Promise<void> {
  console.log('Testing connection string: ', connectionString)
  const dbType = parseConnectionString(connectionString)
  console.log('DB type: ', dbType)
  if (dbType === 'postgres') {
    const client = new pg.Client({ connectionString })
    await client.connect()
    await client.end()
  } else if (dbType === 'mysql') {
    const client = mysql.createConnection(connectionString)
    await new Promise((resolve, reject) => {
      client.connect((err) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
    await new Promise((resolve, reject) => {
      client.end((err) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  } else {
    throw new Error('Invalid connection string')
  }
}

export async function runQuery(connectionString: string, query: string) {
  const client = new pg.Client({ connectionString })
  await client.connect()
  const result = await client.query(query)
  await client.end()
  console.log('Query result: ', result)
  return result
}

export async function generateQuery(
  input: string,
  connectionString: string,
  openAiKey: string,
  existingQuery: string,
  openAiUrl?: string,
  openAiModel?: string
) {
  try {
    const openai = createOpenAI({
      apiKey: openAiKey,
      baseURL: openAiUrl || undefined
    })
    const tableSchema = await getTableSchema(connectionString)
    const existing = existingQuery.trim()

    // Use provided model or default to gpt-4o
    const modelToUse = openAiModel || 'gpt-4o'

    const result = await generateObject({
      model: openai(modelToUse),
      system: `You are a SQL (postgres) and data visualization expert. Your job is to help the user write or modify a SQL query to retrieve the data they need. The table schema is as follows:
      ${tableSchema}
      Only retrieval queries are allowed.

      ${existing.length > 0 ? `The user's existing query is: ${existing}` : ``}

      format the query in a way that is easy to read and understand.
      wrap table names in double quotes
    `,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
      schema: z.object({
        query: z.string()
      }),
      providerOptions: {
        openai: {
          apiKey: openAiKey
        }
      }
    })
    return result.object.query
  } catch (e: any) {
    console.error(e)
    throw new Error('Failed to generate query: ' + e.message)
  }
}

export async function getTableSchema(connectionString: string) {
  const client = new pg.Client({ connectionString })
  await client.connect()
  const schemaQuery = `
    SELECT 
      t.table_name,
      c.column_name,
      c.data_type,
      c.character_maximum_length,
      c.is_nullable,
      c.column_default,
      tc.constraint_type,
      cc.table_name AS foreign_table_name,
      cc.column_name AS foreign_column_name
    FROM 
      information_schema.tables t
    JOIN 
      information_schema.columns c ON t.table_name = c.table_name
    LEFT JOIN 
      information_schema.key_column_usage kcu ON t.table_name = kcu.table_name AND c.column_name = kcu.column_name
    LEFT JOIN 
      information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
    LEFT JOIN 
      information_schema.constraint_column_usage cc ON tc.constraint_name = cc.constraint_name
    WHERE 
      t.table_schema = 'public'
    ORDER BY 
      t.table_name, c.ordinal_position;
  `

  const res = await client.query(schemaQuery)
  await client.end()
  const metadata = res.rows as any[]

  // Format the schema information into a readable string
  const schemaInfo = metadata.reduce((acc: Record<string, any[]>, row) => {
    if (!acc[row.table_name]) {
      acc[row.table_name] = []
    }

    let columnDef = `${row.column_name} ${row.data_type}`
    if (row.character_maximum_length) {
      columnDef += `(${row.character_maximum_length})`
    }
    if (row.is_nullable === 'NO') {
      columnDef += ' NOT NULL'
    }
    if (row.constraint_type === 'PRIMARY KEY') {
      columnDef += ' PRIMARY KEY'
    }
    if (row.constraint_type === 'FOREIGN KEY') {
      columnDef += ` REFERENCES ${row.foreign_table_name}(${row.foreign_column_name})`
    }
    if (row.column_default) {
      columnDef += ` DEFAULT ${row.column_default}`
    }

    acc[row.table_name].push(columnDef)
    return acc
  }, {})

  // Convert to CREATE TABLE format
  return Object.entries(schemaInfo)
    .map(([tableName, columns]) => `${tableName} (\n  ${columns.join(',\n  ')}\n)`)
    .join('\n\n')
}
