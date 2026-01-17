"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed")
        continue
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `issues/${fileName}`

      const { error: uploadError } = await supabase.storage.from("issue-photos").upload(filePath, file)

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("issue-photos").getPublicUrl(filePath)

      newUrls.push(publicUrl)
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
