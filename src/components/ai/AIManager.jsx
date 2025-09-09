import { useState } from 'react'
import { useAIManagement } from '../../hooks/useAI'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { 
  Brain, 
  RefreshCw, 
  Image, 
  FileText, 
  Hash,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export const AIManager = () => {
  const {
    processNews,
    processMultipleNews,
    generateSummary,
    generateImagePrompt,
    generateLinkedInPost,
    generateHashtags,
    isProcessing,
    isProcessingMultiple,
    isGeneratingSummary,
    isGeneratingImagePrompt,
    isGeneratingPost,
    isGeneratingHashtags
  } = useAIManagement()

  const [selectedNewsIds, setSelectedNewsIds] = useState([])
  const [customContent, setCustomContent] = useState('')
  const [generatedContent, setGeneratedContent] = useState({
    summary: '',
    imagePrompt: '',
    post: '',
    hashtags: []
  })

  const handleProcessSelectedNews = async () => {
    if (selectedNewsIds.length === 0) return

    try {
      const result = await processMultipleNews(selectedNewsIds)
      console.log('Processed news:', result)
      setSelectedNewsIds([])
    } catch (error) {
      console.error('Error processing news:', error)
    }
  }

  const handleGenerateSummary = async () => {
    if (!customContent.trim()) return

    try {
      const summary = await generateSummary(customContent, {
        maxLength: 200,
        language: 'es',
        focus: 'professional'
      })
      setGeneratedContent(prev => ({ ...prev, summary }))
    } catch (error) {
      console.error('Error generating summary:', error)
    }
  }

  const handleGenerateImagePrompt = async () => {
    if (!customContent.trim()) return

    try {
      const prompt = await generateImagePrompt('Título de ejemplo', customContent)
      setGeneratedContent(prev => ({ ...prev, imagePrompt: prompt }))
    } catch (error) {
      console.error('Error generating image prompt:', error)
    }
  }

  const handleGeneratePost = async () => {
    if (!customContent.trim()) return

    try {
      const post = await generateLinkedInPost([
        { title: 'Noticia de ejemplo', summary: customContent }
      ], {
        style: 'professional',
        includeHashtags: true,
        maxLength: 1300
      })
      setGeneratedContent(prev => ({ ...prev, post }))
    } catch (error) {
      console.error('Error generating post:', error)
    }
  }

  const handleGenerateHashtags = async () => {
    if (!customContent.trim()) return

    try {
      const hashtags = await generateHashtags('Título de ejemplo', customContent)
      setGeneratedContent(prev => ({ ...prev, hashtags }))
    } catch (error) {
      console.error('Error generating hashtags:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de IA</h2>
          <p className="text-gray-600">Genera contenido con DeepSeek AI</p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-500" />
          <span className="text-sm text-gray-600">DeepSeek AI</span>
        </div>
      </div>

      {/* Procesamiento de noticias */}
      <Card>
        <CardHeader>
          <CardTitle>Procesamiento de Noticias</CardTitle>
          <CardDescription>
            Procesa noticias seleccionadas con IA para generar resúmenes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="IDs de noticias separados por comas (ej: 1,2,3)"
                value={selectedNewsIds.join(',')}
                onChange={(e) => setSelectedNewsIds(
                  e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                )}
                className="flex-1"
              />
              <Button
                onClick={handleProcessSelectedNews}
                disabled={selectedNewsIds.length === 0 || isProcessingMultiple}
                loading={isProcessingMultiple}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Procesar Noticias
              </Button>
            </div>
            {selectedNewsIds.length > 0 && (
              <p className="text-sm text-gray-600">
                {selectedNewsIds.length} noticias seleccionadas para procesar
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generación de contenido personalizado */}
      <Card>
        <CardHeader>
          <CardTitle>Generación de Contenido</CardTitle>
          <CardDescription>
            Genera contenido personalizado a partir de texto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido de entrada
              </label>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Ingresa el contenido de la noticia o texto que quieres procesar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={handleGenerateSummary}
                disabled={!customContent.trim() || isGeneratingSummary}
                loading={isGeneratingSummary}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Resumen</span>
              </Button>

              <Button
                onClick={handleGenerateImagePrompt}
                disabled={!customContent.trim() || isGeneratingImagePrompt}
                loading={isGeneratingImagePrompt}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <Image className="h-5 w-5" />
                <span className="text-sm">Prompt Imagen</span>
              </Button>

              <Button
                onClick={handleGeneratePost}
                disabled={!customContent.trim() || isGeneratingPost}
                loading={isGeneratingPost}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Post LinkedIn</span>
              </Button>

              <Button
                onClick={handleGenerateHashtags}
                disabled={!customContent.trim() || isGeneratingHashtags}
                loading={isGeneratingHashtags}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <Hash className="h-5 w-5" />
                <span className="text-sm">Hashtags</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados generados */}
      {(generatedContent.summary || generatedContent.imagePrompt || generatedContent.post || generatedContent.hashtags.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Contenido Generado</CardTitle>
            <CardDescription>
              Resultados de la generación con IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {generatedContent.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Resumen
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{generatedContent.summary}</p>
                  </div>
                </div>
              )}

              {generatedContent.imagePrompt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Image className="h-4 w-4 mr-2" />
                    Prompt para Imagen
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{generatedContent.imagePrompt}</p>
                  </div>
                </div>
              )}

              {generatedContent.post && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Post para LinkedIn
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{generatedContent.post}</p>
                  </div>
                </div>
              )}

              {generatedContent.hashtags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((hashtag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        #{hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de la API */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de la API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">DeepSeek AI configurado y listo</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
