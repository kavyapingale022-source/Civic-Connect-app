"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LocationPicker } from "@/components/location-picker"
import { PhotoUpload } from "@/components/photo-upload"
import { VoiceRecorder } from "@/components/voice-recorder"
import { Loader2, AlertCircle, Type, Mic } from "lucide-react"
import { toast } from "sonner"
import type { IssueCategory } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"

export default function ReportIssuePage() {
  const router = useRouter()
  const [category, setCategory] = useState<IssueCategory | "">("")
  const [description, setDescription] = useState("")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [descriptionType, setDescriptionType] = useState<"text" | "voice">("text")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState("")
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLocationChange = (lat: number, lng: number, addr: string) => {
    setLatitude(lat)
    setLongitude(lng)
    setAddress(addr)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const hasDescription = descriptionType === "text" ? description.trim() : audioUrl
    
    if (!category || !hasDescription || latitude === null || longitude === null) {
      setError("Please fill in all required fields including a description (text or voice)")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to report an issue")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("issues").insert({
      citizen_id: user.id,
      category,
      description: descriptionType === "text" ? description : "Voice recording attached",
      audio_url: descriptionType === "voice" ? audioUrl : null,
      latitude,
      longitude,
      address,
      photo_urls: photoUrls,
      status: "submitted",
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    toast.success("Issue reported successfully!")
    router.push("/citizen/issues")
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Report a Civic Issue</CardTitle>
          <CardDescription>Fill in the details below to report an issue in your area</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Issue Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Tabs 
                value={descriptionType} 
                onValueChange={(v) => setDescriptionType(v as "text" | "voice")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Type Text
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice Note
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-3">
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </TabsContent>
                <TabsContent value="voice" className="mt-3">
                  <VoiceRecorder 
                    onRecordingComplete={setAudioUrl}
                    existingAudio={audioUrl}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Record a voice message describing the issue. Maximum 2 minutes.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Location *</Label>
              <LocationPicker onLocationChange={handleLocationChange} />
            </div>

            <div className="space-y-2">
              <Label>Photos (Optional)</Label>
              <PhotoUpload onPhotosChange={setPhotoUrls} maxPhotos={3} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
