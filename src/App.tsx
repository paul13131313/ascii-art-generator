import { useState, useRef, useCallback } from 'react'
import { convertToAscii, type ConvertOptions, type AsciiResult } from './lib/asciiEngine'
import { UploadArea } from './components/UploadArea'
import { Settings } from './components/Settings'
import { AsciiPreview } from './components/AsciiPreview'
import html2canvas from 'html2canvas-pro'

const DEFAULT_OPTIONS: ConvertOptions = {
  width: 120,
  mode: 'mono',
  charSet: 'dense',
  contrast: 1.0,
  edgeDetection: false,
}

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [options, setOptions] = useState<ConvertOptions>(DEFAULT_OPTIONS)
  const [result, setResult] = useState<AsciiResult | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [fontSize, setFontSize] = useState(6)
  const previewRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImage(img)
    setPreviewSrc(img.src)
    setResult(null)
  }, [])

  const handleConvert = useCallback(() => {
    if (!image) return
    setIsConverting(true)

    // Use requestAnimationFrame to let UI update
    requestAnimationFrame(() => {
      const canvas = canvasRef.current || document.createElement('canvas')
      // Limit processing size for performance
      const maxDim = 1200
      let w = image.naturalWidth
      let h = image.naturalHeight
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h)
        w = Math.floor(w * scale)
        h = Math.floor(h * scale)
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(image, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)

      const asciiResult = convertToAscii(imageData, w, h, options)
      setResult(asciiResult)

      // Calculate font size to fit preview area
      const previewContainer = document.getElementById('preview-container')
      if (previewContainer) {
        const containerWidth = previewContainer.clientWidth - 32 // padding
        const calculatedSize = Math.max(2, Math.floor(containerWidth / asciiResult.width))
        setFontSize(Math.min(calculatedSize, 12))
      }

      setIsConverting(false)
    })
  }, [image, options])

  const handleSavePng = useCallback(async () => {
    if (!previewRef.current) return
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = 'ascii-art.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('PNG save error:', err)
    }
  }, [])

  const handleSaveTxt = useCallback(() => {
    if (!result) return
    const blob = new Blob([result.text], { type: 'text/plain' })
    const link = document.createElement('a')
    link.download = 'ascii-art.txt'
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }, [result])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[var(--border)]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-wider uppercase m-0">
              ASCII Art Generator
            </h1>
            <p className="text-[10px] tracking-[3px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Photo to Character Art
            </p>
          </div>
          <div className="text-right text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            Dot Matrix Aesthetics
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full p-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full" style={{ minHeight: 'calc(100vh - 140px)' }}>
          {/* Left Panel */}
          <div className="w-full lg:w-[280px] lg:flex-shrink-0 space-y-6">
            <UploadArea onImageLoad={handleImageLoad} previewSrc={previewSrc} />
            <Settings
              options={options}
              onChange={setOptions}
              onConvert={handleConvert}
              onSavePng={handleSavePng}
              onSaveTxt={handleSaveTxt}
              hasImage={!!image}
              hasResult={!!result}
              isConverting={isConverting}
            />
          </div>

          {/* Right Panel - Preview */}
          <div
            id="preview-container"
            className="flex-1 border border-[var(--border)] rounded-lg overflow-hidden bg-white"
          >
            <AsciiPreview ref={previewRef} result={result} fontSize={fontSize} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-[var(--border)] text-center">
        <p className="text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--text-muted)' }}>
          ASCII Art Generator — Character Portrait Engine
        </p>
      </footer>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default App
