"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useGenerateSummary,
  useGenerateImagePrompt,
  useGenerateLinkedInPost,
  useGenerateHashtags,
  useProcessMultipleNewsWithAI,
} from "@/hooks/use-ai"
import {
  Brain,
  RefreshCw,
  Image,
  FileText,
  Hash,
  CheckCircle,
} from "lucide-react"

export function AIManager() {
  const generateSummaryMutation = useGenerateSummary()
  const generateImagePromptMutation = useGenerateImagePrompt()
  const generateLinkedInPostMutation = useGenerateLinkedInPost()
  const generateHashtagsMutation = useGenerateHashtags()
  const processMultipleMutation = useProcessMultipleNewsWithAI()

  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([])
  const [customContent, setCustomContent] = useState("")
  const [generatedContent, setGeneratedContent] = useState({
    summary: "",
    imagePrompt: "",
    post: "",
    hashtags: [] as string[],
  })

  const handleProcessSelectedNews = async () => {
    if (selectedNewsIds.length === 0) return
    try {
      await processMultipleMutation.mutateAsync(selectedNewsIds)
      setSelectedNewsIds([])
    } catch (error) {
      console.error("Error processing news:", error)
    }
  }

  const handleGenerateSummary = async () => {
    if (!customContent.trim()) return
    try {
      const result = await generateSummaryMutation.mutateAsync({
        content: customContent,
        options: { language: "es", maxLength: 200, focus: "professional" },
      })
      setGeneratedContent((prev) => ({ ...prev, summary: result.data }))
    } catch (error) {
      console.error("Error generating summary:", error)
    }
  }

  const handleGenerateImagePrompt = async () => {
    if (!customContent.trim()) return
    try {
      const result = await generateImagePromptMutation.mutateAsync({
        title: "Título de ejemplo",
        summary: customContent,
      })
      setGeneratedContent((prev) => ({ ...prev, imagePrompt: result.data }))
    } catch (error) {
      console.error("Error generating image prompt:", error)
    }
  }

  const handleGeneratePost = async () => {
    if (!customContent.trim()) return
    try {
      const result = await generateLinkedInPostMutation.mutateAsync({
        newsItems: [{ title: "Noticia de ejemplo", summary: customContent }],
        options: { style: "professional", includeHashtags: true, maxLength: 1300 },
      })
      setGeneratedContent((prev) => ({ ...prev, post: result.data }))
    } catch (error) {
      console.error("Error generating post:", error)
    }
  }

  const handleGenerateHashtags = async () => {
    if (!customContent.trim()) return
    try {
      const result = await generateHashtagsMutation.mutateAsync({
        title: "Título de ejemplo",
        summary: customContent,
      })
      setGeneratedContent((prev) => ({ ...prev, hashtags: result.data || [] }))
    } catch (error) {
      console.error("Error generating hashtags:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de IA</h2>
          <p className="text-muted-foreground">Genera contenido con DeepSeek AI</p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-500" />
          <span className="text-sm text-muted-foreground">DeepSeek AI</span>
        </div>
      </div>

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
                value={selectedNewsIds.join(",")}
                onChange={(e) =>
                  setSelectedNewsIds(
                    e.target.value
                      .split(",")
                      .map((id) => parseInt(id.trim()))
                      .filter((id) => !isNaN(id))
                  )
                }
                className="flex-1"
              />
              <Button
                onClick={handleProcessSelectedNews}
                disabled={selectedNewsIds.length === 0 || processMultipleMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Procesar Noticias
              </Button>
            </div>
            {selectedNewsIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedNewsIds.length} noticias seleccionadas para procesar
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={handleGenerateSummary}
                disabled={!customContent.trim() || generateSummaryMutation.isPending}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Resumen</span>
              </Button>
              <Button
                onClick={handleGenerateImagePrompt}
                disabled={!customContent.trim() || generateImagePromptMutation.isPending}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <Image className="h-5 w-5" />
                <span className="text-sm">Prompt Imagen</span>
              </Button>
              <Button
                onClick={handleGeneratePost}
                disabled={!customContent.trim() || generateLinkedInPostMutation.isPending}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Post LinkedIn</span>
              </Button>
              <Button
                onClick={handleGenerateHashtags}
                disabled={!customContent.trim() || generateHashtagsMutation.isPending}
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

      {(generatedContent.summary ||
        generatedContent.imagePrompt ||
        generatedContent.post ||
        generatedContent.hashtags.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Contenido Generado</CardTitle>
            <CardDescription>Resultados de la generación con IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {generatedContent.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> Resumen
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{generatedContent.summary}</p>
                  </div>
                </div>
              )}
              {generatedContent.imagePrompt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Image className="h-4 w-4 mr-2" /> Prompt para Imagen
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{generatedContent.imagePrompt}</p>
                  </div>
                </div>
              )}
              {generatedContent.post && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> Post para LinkedIn
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{generatedContent.post}</p>
                  </div>
                </div>
              )}
              {generatedContent.hashtags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Hash className="h-4 w-4 mr-2" /> Hashtags
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

      <Card>
        <CardHeader>
          <CardTitle>Estado de la API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">DeepSeek AI configurado y listo</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
