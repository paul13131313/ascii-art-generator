import { forwardRef } from 'react'
import type { AsciiResult } from '../lib/asciiEngine'

interface AsciiPreviewProps {
  result: AsciiResult | null
  fontSize: number
}

export const AsciiPreview = forwardRef<HTMLDivElement, AsciiPreviewProps>(
  ({ result, fontSize }, ref) => {
    if (!result) {
      return (
        <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
          <div className="text-center">
            <pre className="text-xs leading-none mb-4 opacity-50">
{`    ___   _____ __________
   /   | / ___// ____/  _/
  / /| | \\__ \\/ /    / /
 / ___ |___/ / /____/ /
/_/  |_/____/\\____/___/   `}
            </pre>
            <p className="text-xs font-bold uppercase tracking-wider">
              Upload an image to start
            </p>
          </div>
        </div>
      )
    }

    const style = {
      fontSize: `${fontSize}px`,
      lineHeight: '1.0',
      letterSpacing: '0px',
    }

    // Color mode
    if (result.colorData) {
      return (
        <div
          ref={ref}
          className="ascii-preview ascii-preview-color p-4"
          style={{ ...style, background: '#fff' }}
        >
          {result.colorData.map((row, rowIdx) => (
            <div key={rowIdx} style={{ height: `${fontSize}px` }}>
              {row.map((cell, colIdx) => (
                <span key={colIdx} style={{ color: cell.color }}>
                  {cell.char}
                </span>
              ))}
            </div>
          ))}
        </div>
      )
    }

    // Mono mode
    return (
      <div
        ref={ref}
        className="ascii-preview p-4"
        style={{ ...style, background: '#fff', color: '#1a1a1a' }}
      >
        {result.text}
      </div>
    )
  }
)

AsciiPreview.displayName = 'AsciiPreview'
