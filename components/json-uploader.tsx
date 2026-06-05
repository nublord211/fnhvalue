"use client"

import { Item } from "@/lib/types"
import { Upload } from "lucide-react"
import { useRef } from "react"

interface JsonUploaderProps {
  onUpload: (items: Item[]) => void
}

export function JsonUploader({ onUpload }: JsonUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (Array.isArray(json)) {
          onUpload(json)
        } else if (json.items && Array.isArray(json.items)) {
          onUpload(json.items)
        } else {
          alert("Invalid JSON format. Expected an array of items or an object with an 'items' array.")
        }
      } catch {
        alert("Failed to parse JSON file.")
      }
    }
    reader.readAsText(file)
    
    // Reset input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex justify-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        id="json-upload"
      />
      <label
        htmlFor="json-upload"
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
      >
        <Upload className="w-4 h-4" />
        Upload JSON
      </label>
    </div>
  )
}
