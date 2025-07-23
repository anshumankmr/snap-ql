import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { ChevronDown } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { ModeToggle } from './ui/mode-toggle'

export const Settings = () => {
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'ollama'>('openai')
  const [openAIApiKey, setOpenAIApiKey] = useState<string>('')
  const [claudeApiKey, setClaudeApiKey] = useState<string>('')
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [apiKeySuccess, setApiKeySuccess] = useState<string | null>(null)
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)
  const [openAIBaseUrl, setOpenAIBaseUrl] = useState<string>('')
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>('')
  const [ollamaModel, setOllamaModel] = useState<string>('')
  const [baseUrlError, setBaseUrlError] = useState<string | null>(null)
  const [baseUrlSuccess, setBaseUrlSuccess] = useState<string | null>(null)
  const [isSavingBaseUrl, setIsSavingBaseUrl] = useState(false)
  const [openAIModel, setOpenAIModel] = useState<string>('')
  const [claudeModel, setClaudeModel] = useState<string>('')
  const [modelError, setModelError] = useState<string | null>(null)
  const [modelSuccess, setModelSuccess] = useState<string | null>(null)
  const [isSavingModel, setIsSavingModel] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const { toast } = useToast()

  // Load the saved AI provider when the component mounts
  useEffect(() => {
    const loadSavedAiProvider = async () => {
      try {
        if (window.context && typeof window.context.getAiProvider === 'function') {
          const savedAiProvider = await window.context.getAiProvider()
          setAiProvider(savedAiProvider)
        } else {
          throw new Error('window.context.getAiProvider is not defined')
        }
      } catch (error: any) {
        console.error('Failed to load AI provider:', error)
      }
    }
    loadSavedAiProvider()
  }, [toast])

  // Load the saved OpenAI API key when the component mounts
  useEffect(() => {
    const loadSavedApiKey = async () => {
      try {
        const savedApiKey = await window.context.getOpenAiKey()
        if (savedApiKey) {
          setOpenAIApiKey(savedApiKey)
        }
      } catch (error: any) {
        setApiKeyError('Failed to load the OpenAI API key. Please try again.')
      }
    }
    loadSavedApiKey()
  }, [toast])

  // Load the saved Claude API key when the component mounts
  useEffect(() => {
    const loadSavedClaudeApiKey = async () => {
      try {
        const savedApiKey = await window.context.getClaudeApiKey()
        if (savedApiKey) {
          setClaudeApiKey(savedApiKey)
        }
      } catch (error: any) {
        setApiKeyError('Failed to load the Claude API key. Please try again.')
      }
    }
    loadSavedClaudeApiKey()
  }, [toast])

  // Load the saved OpenAI base URL when the component mounts
  useEffect(() => {
    const loadSavedBaseUrl = async () => {
      try {
        const savedBaseUrl = await window.context.getOpenAiBaseUrl()
        if (savedBaseUrl) {
          setOpenAIBaseUrl(savedBaseUrl)
        }
      } catch (error: any) {
        setBaseUrlError('Failed to load the OpenAI base URL. Please try again.')
      }
    }
    loadSavedBaseUrl()
  }, [toast])

  // Load the saved OpenAI model when the component mounts
  useEffect(() => {
    const loadSavedModel = async () => {
      try {
        const savedModel = await window.context.getOpenAiModel()
        if (savedModel) {
          setOpenAIModel(savedModel)
        }
      } catch (error: any) {
        setModelError('Failed to load the OpenAI model. Please try again.')
      }
    }
    loadSavedModel()
  }, [toast])

  // Load the saved Claude model when the component mounts
  useEffect(() => {
    const loadSavedClaudeModel = async () => {
      try {
        const savedModel = await window.context.getClaudeModel()
        if (savedModel) {
          setClaudeModel(savedModel)
        }
      } catch (error: any) {
        setModelError('Failed to load the Claude model. Please try again.')
      }
    }
    loadSavedClaudeModel()
  }, [toast])

  // Load the saved Ollama base URL when the component mounts
  useEffect(() => {
    const loadOllamaBaseUrl = async () => {
      try {
        if (window.context && typeof window.context.getOllamaBaseUrl === 'function') {
          const url = await window.context.getOllamaBaseUrl()
          if (url) setOllamaBaseUrl(url)
        } else {
          throw new Error('window.context.getOllamaBaseUrl is not defined')
        }
      } catch (error) {
        console.error('Failed to load Ollama base URL:', error)
      }
    }
    loadOllamaBaseUrl()
  }, [])

  // Load the saved Ollama model when the component mounts
  useEffect(() => {
    const loadOllamaModel = async () => {
      try {
        const model = await window.context.getOllamaModel()
        if (model) setOllamaModel(model)
      } catch (error) {
        console.error('Failed to load Ollama model:', error)
      }
    }
    loadOllamaModel()
  }, [])

  const updateAiProvider = async (provider: 'openai' | 'claude' | 'ollama') => {
    try {
      await window.context.setAiProvider(provider)
      setAiProvider(provider)
    } catch (error: any) {
      console.error('Failed to save AI provider:', error)
    }
  }

  const updateApiKey = async () => {
    setIsSavingApiKey(true)
    setApiKeySuccess(null)
    setApiKeyError(null)
    try {
      if (aiProvider === 'openai') {
        await window.context.setOpenAiKey(openAIApiKey)
        setApiKeySuccess('OpenAI API key saved successfully.')
      } else if (aiProvider === 'claude') {
        await window.context.setClaudeApiKey(claudeApiKey)
        setApiKeySuccess('Claude API key saved successfully.')
      } else if (aiProvider === 'ollama') {
        // For Ollama, save the base URL and model
        await window.context.setOllamaBaseUrl(ollamaBaseUrl)
        if (ollamaModel) {
          await window.context.setOllamaModel(ollamaModel)
        }
        setApiKeySuccess('Ollama configuration saved successfully.')
      }
    } catch (error: any) {
      setApiKeyError(
        `Failed to save the ${aiProvider === 'openai' ? 'OpenAI' : aiProvider === 'claude' ? 'Claude' : 'Ollama'} configuration: ` +
          error.message
      )
    } finally {
      setIsSavingApiKey(false)
    }
  }

  const updateOpenAIBaseUrl = async () => {
    setIsSavingBaseUrl(true)
    setBaseUrlSuccess(null)
    setBaseUrlError(null)
    try {
      await window.context.setOpenAiBaseUrl(openAIBaseUrl)
      setBaseUrlError(null)
      setBaseUrlSuccess('Base URL saved successfully.')
    } catch (error: any) {
      setBaseUrlError('Failed to save the OpenAI base URL: ' + error.message)
    } finally {
      setIsSavingBaseUrl(false)
    }
  }

  const updateModel = async () => {
    setIsSavingModel(true)
    setModelSuccess(null)
    setModelError(null)
    try {
      if (aiProvider === 'openai') {
        await window.context.setOpenAiModel(openAIModel)
        setModelSuccess('OpenAI model saved successfully.')
      } else if (aiProvider === 'claude') {
        await window.context.setClaudeModel(claudeModel)
        setModelSuccess('Claude model saved successfully.')
      } else if (aiProvider === 'ollama') {
        await window.context.setOllamaModel(ollamaModel)
        setModelSuccess('Ollama model saved successfully.')
      }
      setModelError(null)
    } catch (error: any) {
      setModelError(
        `Failed to save the ${aiProvider === 'openai' ? 'OpenAI' : aiProvider === 'claude' ? 'Claude' : 'Ollama'} model: ` +
          error.message
      )
    } finally {
      setIsSavingModel(false)
    }
  }

  // Function to determine if save button should be disabled
  const isSaveDisabled = () => {
    if (isSavingApiKey) return true

    if (aiProvider === 'openai') {
      return !openAIApiKey.trim()
    } else if (aiProvider === 'claude') {
      return !claudeApiKey.trim()
    } else if (aiProvider === 'ollama') {
      return !ollamaBaseUrl.trim()
    }

    return true
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure your AI provider and application settings.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">AI Provider</CardTitle>
              <CardDescription className="text-xs">
                Configure your AI provider for query generation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="ai-provider" className="text-xs">
              Provider
            </Label>
            <Select value={aiProvider} onValueChange={updateAiProvider}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional rendering based on AI provider */}
          {aiProvider === 'ollama' ? (
            // Ollama configuration
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ollama-base-url" className="text-xs">
                  Base URL
                </Label>
                <Input
                  id="ollama-base-url"
                  type="text"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434/v1/"
                  className="font-mono text-xs h-8"
                />
                <p className="text-xs text-muted-foreground">
                  URL where your Ollama instance is running.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ollama-model" className="text-xs">
                  Model (Optional)
                </Label>
                <Input
                  id="ollama-model"
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3"
                  className="font-mono text-xs h-8"
                />
                <p className="text-xs text-muted-foreground">
                  Model name to use. Leave empty to use default.
                </p>
              </div>
            </div>
          ) : (
            // OpenAI and Claude API key configuration
            <div className="space-y-1.5">
              <Label htmlFor="api-key" className="text-xs">
                API Key
              </Label>
              <Input
                id="api-key"
                type="text"
                value={aiProvider === 'openai' ? openAIApiKey : claudeApiKey}
                onChange={(e) =>
                  aiProvider === 'openai'
                    ? setOpenAIApiKey(e.target.value)
                    : setClaudeApiKey(e.target.value)
                }
                placeholder={aiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                className="font-mono text-xs h-8"
              />
              <p className="text-xs text-muted-foreground">
                {aiProvider === 'openai' ? (
                  <>
                    You can create an API key at{' '}
                    <a
                      href="https://platform.openai.com/account/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      OpenAI API Keys
                    </a>
                    .
                  </>
                ) : (
                  <>
                    You can create an API key at{' '}
                    <a
                      href="https://console.anthropic.com/account/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Anthropic Console
                    </a>
                    .
                  </>
                )}
              </p>
            </div>
          )}

          {apiKeyError && <p className="text-xs text-destructive">{apiKeyError}</p>}
          {apiKeySuccess && <p className="text-xs text-green-500">{apiKeySuccess}</p>}

          <Button
            onClick={updateApiKey}
            disabled={isSaveDisabled()}
            className="flex items-center space-x-1.5 h-8 px-3 text-xs"
            size="sm"
          >
            <span>{isSavingApiKey ? 'Saving...' : 'Save Configuration'}</span>
          </Button>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1.5 h-8 px-3 text-xs">
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
                />
                <span>Advanced Options</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {aiProvider === 'openai' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="openai-base-url" className="text-xs">
                      Base URL (Optional)
                    </Label>
                    <Input
                      id="openai-base-url"
                      type="text"
                      value={openAIBaseUrl}
                      onChange={(e) => setOpenAIBaseUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      className="font-mono text-xs h-8"
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Custom base URL for OpenAI API. Leave empty to use the default OpenAI
                      endpoint. Useful for OpenAI-compatible APIs like Azure OpenAI or local models.
                    </p>
                    {baseUrlError && <p className="text-xs text-destructive">{baseUrlError}</p>}
                    {baseUrlSuccess && <p className="text-xs text-green-500">{baseUrlSuccess}</p>}
                  </div>

                  <Button
                    onClick={updateOpenAIBaseUrl}
                    disabled={isSavingBaseUrl}
                    className="flex items-center space-x-1.5 h-8 px-3 text-xs"
                    size="sm"
                    variant="outline"
                  >
                    <span>{isSavingBaseUrl ? 'Saving...' : 'Save Base URL'}</span>
                  </Button>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs">
                  Model (Optional)
                </Label>
                <Input
                  id="model"
                  type="text"
                  value={
                    aiProvider === 'openai'
                      ? openAIModel
                      : aiProvider === 'claude'
                        ? claudeModel
                        : ollamaModel
                  }
                  onChange={(e) => {
                    if (aiProvider === 'openai') {
                      setOpenAIModel(e.target.value)
                    } else if (aiProvider === 'claude') {
                      setClaudeModel(e.target.value)
                    } else {
                      setOllamaModel(e.target.value)
                    }
                  }}
                  placeholder={
                    aiProvider === 'openai'
                      ? 'gpt-4o'
                      : aiProvider === 'claude'
                        ? 'claude-sonnet-4-20250514'
                        : 'llama3'
                  }
                  className="font-mono text-xs h-8"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {aiProvider === 'openai' ? (
                    <>
                      Model ID to use for query generation. Leave empty to use gpt-4o (default).
                      Examples: gpt-4, gpt-3.5-turbo, gpt-4o-mini.
                    </>
                  ) : aiProvider === 'claude' ? (
                    <>
                      Model ID to use for query generation. Leave empty to use
                      claude-sonnet-4-20250514 (default).
                    </>
                  ) : (
                    <>
                      Model name to use for query generation. Examples: llama3, codellama, mistral.
                    </>
                  )}
                </p>
                {modelError && <p className="text-xs text-destructive">{modelError}</p>}
                {modelSuccess && <p className="text-xs text-green-500">{modelSuccess}</p>}
              </div>

              <Button
                onClick={updateModel}
                disabled={isSavingModel}
                className="flex items-center space-x-1.5 h-8 px-3 text-xs"
                size="sm"
                variant="outline"
              >
                <span>{isSavingModel ? 'Saving...' : 'Save Model'}</span>
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Theme Settings</CardTitle>
          <CardDescription className="text-xs">
            Toggle between light, dark, and system themes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex">
            <ModeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
