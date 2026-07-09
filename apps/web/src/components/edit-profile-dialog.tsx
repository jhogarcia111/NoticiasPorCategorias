"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/use-profile"
import { cn } from "@/lib/utils"
import { X, Upload, Camera, Save, Key, User, Loader2 } from "lucide-react"

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileDialog({ isOpen, onClose }: EditProfileDialogProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const { data: profile, isLoading: profileLoading } = useProfile(userId)
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const [username, setUsername] = useState("")
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [initialized, setInitialized] = useState(false)

  if (profile && !initialized) {
    setUsername(profile.username || "")
    setAvatarDataUrl(profile.avatarUrl || null)
    setInitialized(true)
  }

  if (!isOpen) return null

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "La imagen no debe superar los 2MB" })
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarDataUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!userId) return
    setMessage(null)
    try {
      await updateProfile.mutateAsync({
        userId,
        username: username.trim() || undefined,
        avatarUrl: avatarDataUrl || undefined,
      })
      setMessage({ type: "success", text: "Perfil actualizado correctamente" })
      setTimeout(() => { onClose(); setMessage(null) }, 1500)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al actualizar perfil" })
    }
  }

  const handleChangePassword = async () => {
    if (!userId) return
    setMessage(null)
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" })
      return
    }
    try {
      await changePassword.mutateAsync({ userId, currentPassword, newPassword })
      setMessage({ type: "success", text: "Contraseña actualizada correctamente" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => { onClose(); setMessage(null) }, 1500)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al cambiar contraseña" })
    }
  }

  const initials = (profile?.username || session?.user?.email || "U").charAt(0).toUpperCase()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Editar Perfil</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors text-center",
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-4 w-4 inline mr-1.5" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors text-center",
              activeTab === "password"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Key className="h-4 w-4 inline mr-1.5" />
            Contraseña
          </button>
        </div>

        {message && (
          <div
            className={cn(
              "mx-6 mt-4 p-3 rounded-md text-sm",
              message.type === "success" && "bg-green-50 text-green-800 border border-green-200",
              message.type === "error" && "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {message.text}
          </div>
        )}

        {profileLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeTab === "profile" ? (
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold overflow-hidden">
                  {avatarDataUrl ? (
                    <img src={avatarDataUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Click en la cámara para cambiar foto</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre de usuario"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-input bg-muted rounded-md text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">El email no se puede cambiar</p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar Cambios
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changePassword.isPending}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {changePassword.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              Cambiar Contraseña
            </button>
          </div>
        )}

        <div className="px-6 py-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}