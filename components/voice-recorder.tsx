"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onRecordingComplete: (audioData: string | null) => void
  existingAudio?: string | null
}

export function VoiceRecorder({ onRecordingComplete, existingAudio = null }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        
        // Convert to base64
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          setAudioUrl(base64Audio)
          onRecordingComplete(base64Audio)
          setIsProcessing(false)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setDuration(0)
      
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
      
    } catch (error) {
      toast.error("Could not access microphone. Please grant permission.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playAudio = () => {
    if (audioUrl && !isPlaying) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setIsPlaying(true)
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
      }
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setAudioUrl(null)
    setDuration(0)
    setIsPlaying(false)
    onRecordingComplete(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-3">
      {!audioUrl && !isRecording && !isProcessing && (
        <Button
          type="button"
          variant="outline"
          onClick={startRecording}
          className="w-full h-20 border-dashed flex flex-col gap-1 bg-transparent"
        >
          <Mic className="h-6 w-6" />
          <span className="text-sm">Tap to record voice note</span>
        </Button>
      )}

      {isRecording && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
            </span>
            <span className="font-medium text-destructive">Recording...</span>
          </div>
          <span className="text-2xl font-mono">{formatTime(duration)}</span>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={stopRecording}
            className="rounded-full w-14 h-14"
          >
            <Square className="h-6 w-6 fill-current" />
          </Button>
          <span className="text-xs text-muted-foreground">Tap to stop</span>
        </div>
      )}

      {isProcessing && (
        <div className="bg-muted rounded-lg p-4 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing recording...</span>
        </div>
      )}

      {audioUrl && !isRecording && !isProcessing && (
        <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={playAudio}
            className="rounded-full h-12 w-12 shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-primary rounded-full transition-all",
                  isPlaying && "animate-pulse"
                )}
                style={{ width: isPlaying ? "100%" : "0%" }}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              Voice recording ({formatTime(duration)})
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={deleteRecording}
            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
