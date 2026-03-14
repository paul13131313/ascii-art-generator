import { useState, useRef, useCallback } from 'react'

interface UploadAreaProps {
  onImageLoad: (img: HTMLImageElement) => void
  previewSrc: string | null
}

export function UploadArea({ onImageLoad, previewSrc }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => onImageLoad(img)
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    },
    [onImageLoad]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div
      className={`upload-area rounded-lg p-6 text-center cursor-pointer ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      {previewSrc ? (
        <img
          src={previewSrc}
          alt="Original"
          className="max-w-full max-h-[300px] mx-auto rounded"
        />
      ) : (
        <div className="py-12">
          <div className="text-4xl mb-3">⬆</div>
          <p className="text-sm font-bold uppercase tracking-wider">
            Drop image here
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            JPG / PNG / WEBP
          </p>
        </div>
      )}
    </div>
  )
}
