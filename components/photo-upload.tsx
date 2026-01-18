"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PhotoUploadProps {
  onPhotosChange: (urls: string[]) => void
  maxPhotos?: number
  existingUrls?: string[]
}

export function PhotoUpload({ onPhotosChange, maxPhotos = 3, existingUrls = [] }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingUrls)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const compressImage = (base64: string, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.7))
      }
      img.src = base64
    })
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    setUploading(true)
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed")
        continue
      }

      try {
        const base64 = await convertToBase64(file)
        const compressed = await compressImage(base64)
        newUrls.push(compressed)
      } catch {
        toast.error(`Failed to process ${file.name}`)
      }
    }

    const updatedPhotos = [...photos, ...newUrls]
    setPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= maxPhotos}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url || "/placeholder.svg"}
                alt={`Photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {photos.length}/{maxPhotos} photos uploaded
      </p>
    </div>
  )
}
