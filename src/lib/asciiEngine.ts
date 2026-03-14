// Character sets ordered by density (dark → light)
export const CHAR_SETS = {
  standard: '@%#*+=-:. ',
  dense: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  numbers: '8643209751 ',
  blocks: '█▓▒░ ',
} as const

export type CharSetKey = keyof typeof CHAR_SETS

export interface ConvertOptions {
  width: number
  mode: 'mono' | 'color'
  charSet: CharSetKey | string
  contrast: number
  edgeDetection: boolean
}

interface PixelData {
  r: number
  g: number
  b: number
  brightness: number
}

// Get the character set string
function getCharSet(charSet: CharSetKey | string): string {
  if (charSet in CHAR_SETS) {
    return CHAR_SETS[charSet as CharSetKey]
  }
  // Custom character set: sort by assumed density
  return charSet.length > 1 ? charSet : CHAR_SETS.standard
}

// Map brightness (0-255) to a character
function brightnessToChar(brightness: number, chars: string): string {
  const index = Math.floor((brightness / 255) * (chars.length - 1))
  return chars[chars.length - 1 - index] // reverse: dark chars for low brightness
}

// Apply contrast adjustment
function applyContrast(value: number, contrast: number): number {
  const factor = (259 * (contrast * 128 + 255)) / (255 * (259 - contrast * 128))
  const result = factor * (value - 128) + 128
  return Math.max(0, Math.min(255, result))
}

// Sobel edge detection
function sobelFilter(
  pixels: PixelData[][],
  row: number,
  col: number,
  rows: number,
  cols: number
): { magnitude: number; direction: number } {
  if (row <= 0 || row >= rows - 1 || col <= 0 || col >= cols - 1) {
    return { magnitude: 0, direction: 0 }
  }

  const gx =
    -pixels[row - 1][col - 1].brightness +
    pixels[row - 1][col + 1].brightness +
    -2 * pixels[row][col - 1].brightness +
    2 * pixels[row][col + 1].brightness +
    -pixels[row + 1][col - 1].brightness +
    pixels[row + 1][col + 1].brightness

  const gy =
    -pixels[row - 1][col - 1].brightness +
    -2 * pixels[row - 1][col].brightness +
    -pixels[row - 1][col + 1].brightness +
    pixels[row + 1][col - 1].brightness +
    2 * pixels[row + 1][col].brightness +
    pixels[row + 1][col + 1].brightness

  const magnitude = Math.sqrt(gx * gx + gy * gy)
  const direction = Math.atan2(gy, gx)

  return { magnitude, direction }
}

// Map edge direction to a character
function edgeDirectionToChar(direction: number): string {
  const angle = ((direction * 180) / Math.PI + 180) % 180
  if (angle < 22.5 || angle >= 157.5) return '-'
  if (angle < 67.5) return '/'
  if (angle < 112.5) return '|'
  return '\\'
}

export interface AsciiResult {
  text: string
  colorData: Array<Array<{ char: string; color: string }>> | null
  width: number
  height: number
}

export function convertToAscii(
  imageData: ImageData,
  imgWidth: number,
  imgHeight: number,
  options: ConvertOptions
): AsciiResult {
  const { width: charWidth, mode, charSet, contrast, edgeDetection } = options

  // Character aspect ratio compensation (chars are taller than wide)
  const aspectRatio = 0.5
  const cellWidth = imgWidth / charWidth
  const cellHeight = cellWidth / aspectRatio
  const charHeight = Math.floor(imgHeight / cellHeight)

  const chars = getCharSet(charSet)
  const data = imageData.data

  // Build pixel grid
  const pixelGrid: PixelData[][] = []

  for (let row = 0; row < charHeight; row++) {
    const pixelRow: PixelData[] = []
    for (let col = 0; col < charWidth; col++) {
      let rSum = 0,
        gSum = 0,
        bSum = 0,
        count = 0

      const startY = Math.floor(row * cellHeight)
      const endY = Math.min(Math.floor((row + 1) * cellHeight), imgHeight)
      const startX = Math.floor(col * cellWidth)
      const endX = Math.min(Math.floor((col + 1) * cellWidth), imgWidth)

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * imgWidth + x) * 4
          rSum += data[idx]
          gSum += data[idx + 1]
          bSum += data[idx + 2]
          count++
        }
      }

      if (count === 0) count = 1
      const r = rSum / count
      const g = gSum / count
      const b = bSum / count
      // Perceived brightness (luminance formula)
      let brightness = 0.299 * r + 0.587 * g + 0.114 * b
      brightness = applyContrast(brightness, contrast)

      pixelRow.push({ r, g, b, brightness })
    }
    pixelGrid.push(pixelRow)
  }

  // Generate ASCII
  const lines: string[] = []
  const colorData: Array<Array<{ char: string; color: string }>> = []
  const edgeThreshold = 50

  for (let row = 0; row < charHeight; row++) {
    let line = ''
    const colorRow: Array<{ char: string; color: string }> = []

    for (let col = 0; col < charWidth; col++) {
      const pixel = pixelGrid[row][col]
      let char: string

      if (edgeDetection) {
        const edge = sobelFilter(pixelGrid, row, col, charHeight, charWidth)
        if (edge.magnitude > edgeThreshold) {
          char = edgeDirectionToChar(edge.direction)
        } else {
          char = brightnessToChar(pixel.brightness, chars)
        }
      } else {
        char = brightnessToChar(pixel.brightness, chars)
      }

      line += char

      if (mode === 'color') {
        const r = Math.round(pixel.r)
        const g = Math.round(pixel.g)
        const b = Math.round(pixel.b)
        colorRow.push({ char, color: `rgb(${r},${g},${b})` })
      }
    }

    lines.push(line)
    if (mode === 'color') {
      colorData.push(colorRow)
    }
  }

  return {
    text: lines.join('\n'),
    colorData: mode === 'color' ? colorData : null,
    width: charWidth,
    height: charHeight,
  }
}
