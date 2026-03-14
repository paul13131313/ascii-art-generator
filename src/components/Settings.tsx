import { type ConvertOptions, type CharSetKey } from '../lib/asciiEngine'

interface SettingsProps {
  options: ConvertOptions
  onChange: (options: ConvertOptions) => void
  onConvert: () => void
  onSavePng: () => void
  onSaveTxt: () => void
  hasImage: boolean
  hasResult: boolean
  isConverting: boolean
}

const RESOLUTIONS = [
  { label: '80', value: 80 },
  { label: '120', value: 120 },
  { label: '160', value: 160 },
  { label: '200', value: 200 },
]

const CHAR_SET_OPTIONS: { label: string; value: CharSetKey }[] = [
  { label: 'Standard', value: 'standard' },
  { label: 'High Density', value: 'dense' },
  { label: 'Numbers', value: 'numbers' },
  { label: 'Blocks', value: 'blocks' },
]

export function Settings({
  options,
  onChange,
  onConvert,
  onSavePng,
  onSaveTxt,
  hasImage,
  hasResult,
  isConverting,
}: SettingsProps) {
  const update = (partial: Partial<ConvertOptions>) => {
    onChange({ ...options, ...partial })
  }

  return (
    <div className="space-y-5">
      {/* Resolution */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
          Resolution
        </label>
        <div className="flex gap-2">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => update({ width: r.value })}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                options.width === r.value
                  ? 'bg-[var(--text)] text-[var(--bg)]'
                  : 'bg-transparent border border-[var(--border)] hover:border-[var(--text)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
          Mode
        </label>
        <div className="flex gap-2">
          {(['mono', 'color'] as const).map((m) => (
            <button
              key={m}
              onClick={() => update({ mode: m })}
              className={`px-3 py-1.5 text-xs font-bold rounded uppercase transition-all ${
                options.mode === m
                  ? 'bg-[var(--text)] text-[var(--bg)]'
                  : 'bg-transparent border border-[var(--border)] hover:border-[var(--text)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Character Set */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
          Character Set
        </label>
        <div className="flex flex-wrap gap-2">
          {CHAR_SET_OPTIONS.map((cs) => (
            <button
              key={cs.value}
              onClick={() => update({ charSet: cs.value })}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                options.charSet === cs.value
                  ? 'bg-[var(--text)] text-[var(--bg)]'
                  : 'bg-transparent border border-[var(--border)] hover:border-[var(--text)]'
              }`}
            >
              {cs.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contrast */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
          Contrast: {options.contrast.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={options.contrast}
          onChange={(e) => update({ contrast: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Edge Detection */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold uppercase tracking-wider">
          Edge Detection
        </label>
        <button
          onClick={() => update({ edgeDetection: !options.edgeDetection })}
          className={`w-10 h-5 rounded-full transition-all relative ${
            options.edgeDetection ? 'bg-[var(--text)]' : 'bg-[var(--border)]'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
              options.edgeDetection ? 'left-5.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={onConvert}
          disabled={!hasImage || isConverting}
          className="btn btn-primary px-4 py-2.5 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onSavePng}
            disabled={!hasResult}
            className="btn btn-secondary px-4 py-2 rounded text-xs flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save PNG
          </button>
          <button
            onClick={onSaveTxt}
            disabled={!hasResult}
            className="btn btn-secondary px-4 py-2 rounded text-xs flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save TXT
          </button>
        </div>
      </div>
    </div>
  )
}
