"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2, Navigation } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
}

export function LocationPicker({ onLocationChange, initialLat, initialLng }: LocationPickerProps) {
  const [latitude, setLatitude] = useState(initialLat?.toString() || "")
  const [longitude, setLongitude] = useState(initialLng?.toString() || "")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLatitude(lat.toString())
        setLongitude(lng.toString())

        // Reverse geocoding using Nominatim
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          const data = await response.json()
          const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          setAddress(addr)
          onLocationChange(lat, lng, addr)
        } catch {
          const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          setAddress(addr)
          onLocationChange(lat, lng, addr)
        }
        setLoading(false)
      },
      (err) => {
        setError(`Unable to get location: ${err.message}`)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  useEffect(() => {
    if (latitude && longitude && !address) {
      const lat = Number.parseFloat(latitude)
      const lng = Number.parseFloat(longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        onLocationChange(lat, lng, address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      }
    }
  }, [latitude, longitude, address, onLocationChange])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex-1 bg-transparent"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
          Get Current Location
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="e.g., 40.7128"
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value)
              const lat = Number.parseFloat(e.target.value)
              const lng = Number.parseFloat(longitude)
              if (!isNaN(lat) && !isNaN(lng)) {
                onLocationChange(lat, lng, address)
              }
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="e.g., -74.0060"
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value)
              const lat = Number.parseFloat(latitude)
              const lng = Number.parseFloat(e.target.value)
              if (!isNaN(lat) && !isNaN(lng)) {
                onLocationChange(lat, lng, address)
              }
            }}
            required
          />
        </div>
      </div>

      {address && (
        <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
          <p className="text-sm">{address}</p>
        </div>
      )}
    </div>
  )
}
