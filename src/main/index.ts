import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../logo.png?asset'
import { generateQuery, runQuery, testPostgresConnection } from './lib/db'
import {
  getConnectionString,
  getOpenAiKey,
  setConnectionString,
  setOpenAiKey,
  getOpenAiBaseUrl,
  setOpenAiBaseUrl,
  getOpenAiModel,
  setOpenAiModel,
  getQueryHistory,
  addQueryToHistory
} from './lib/state'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    minWidth: 600,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('setConnectionString', async (_, connectionString) => {
    console.log('Setting connection string: ', connectionString)
    const valid = await testPostgresConnection(connectionString)
    if (valid) {
      await setConnectionString(connectionString.length > 0 ? connectionString : null)
      return true
    } else {
      return false
    }
  })

  ipcMain.handle('getConnectionString', async () => {
    return (await getConnectionString()) ?? ''
  })

  ipcMain.handle('getOpenAiKey', async () => {
    return (await getOpenAiKey()) ?? ''
  })

  ipcMain.handle('setOpenAiKey', async (_, openAiKey) => {
    await setOpenAiKey(openAiKey)
  })

  ipcMain.handle('getOpenAiBaseUrl', async () => {
    return (await getOpenAiBaseUrl()) ?? ''
  })

  ipcMain.handle('setOpenAiBaseUrl', async (_, openAiBaseUrl) => {
    await setOpenAiBaseUrl(openAiBaseUrl)
  })

  ipcMain.handle('getOpenAiModel', async () => {
    return (await getOpenAiModel()) ?? ''
  })

  ipcMain.handle('setOpenAiModel', async (_, openAiModel) => {
    await setOpenAiModel(openAiModel)
  })

  ipcMain.handle('generateQuery', async (_, input, existingQuery) => {
    try {
      console.log('Generating query with input: ', input, 'and existing query: ', existingQuery)
      const connectionString = await getConnectionString()
      const openAiKey = await getOpenAiKey()
      const openAiBaseUrl = await getOpenAiBaseUrl()
      const openAiModel = await getOpenAiModel()
      const query = await generateQuery(
        input,
        connectionString,
        openAiKey,
        existingQuery,
        openAiBaseUrl,
        openAiModel
      )
      return {
        error: null,
        data: query
      }
    } catch (error: any) {
      return {
        error: error.message,
        data: null
      }
    }
  })

  ipcMain.handle('runQuery', async (_, query) => {
    try {
      const connectionString = await getConnectionString()
      if (connectionString.length === 0) {
        return { error: 'No connection string set' }
      }
      const res = await runQuery(connectionString, query)
      return {
        error: null,
        data: res.rows
      }
    } catch (error: any) {
      return {
        error: error.message,
        data: null
      }
    }
  })

  ipcMain.handle('getQueryHistory', async () => {
    try {
      const history = await getQueryHistory()
      return history
    } catch (error: any) {
      console.error('Error loading query history:', error)
      return []
    }
  })

  ipcMain.handle('addQueryToHistory', async (_, queryEntry) => {
    try {
      await addQueryToHistory(queryEntry)
      return true
    } catch (error: any) {
      console.error('Error saving query to history:', error)
      return false
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
