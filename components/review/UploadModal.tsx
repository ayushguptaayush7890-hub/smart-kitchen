"use client"

import { useRef, useEffect } from "react"
import { X, Upload, Video, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

type UploadModalProps = {
  open: boolean
  onClose: () => void
  videoFile: File | null
  previewUrl: string | null
  onFileChange: (file: File | null) => void
  onSubmit: () => void
  isAnalyzing: boolean
}

export function UploadModal({
  open,
  onClose,
  videoFile,
  previewUrl,
  onFileChange,
  onSubmit,
  isAnalyzing,
}: UploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="upload-modal-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Upload your dish
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null
              onFileChange(f)
            }}
          />

          {!previewUrl ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 py-12 px-4 transition-all group"
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
              <p className="text-foreground font-medium">Choose a cooking video</p>
              <p className="text-sm text-muted-foreground mt-1">MP4, WebM, MOV — max practical size ~100MB</p>
            </button>
          ) : (
            <div className="rounded-xl overflow-hidden border border-border bg-black">
              <video src={previewUrl} controls className="w-full max-h-56 object-contain" playsInline />
              <div className="p-3 flex justify-end bg-card/95 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onFileChange(null)
                    if (inputRef.current) inputRef.current.value = ""
                  }}
                >
                  Remove video
                </Button>
              </div>
            </div>
          )}

          <Button
            type="button"
            className="w-full gap-2 gradient-button text-primary-foreground py-6"
            disabled={!videoFile || isAnalyzing}
            onClick={onSubmit}
          >
            <Sparkles className="w-5 h-5" />
            {isAnalyzing ? "AI is analyzing…" : "Submit for AI Review"}
          </Button>
        </div>
      </div>
    </div>
  )
}
