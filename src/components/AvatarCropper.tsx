'use client'

import { useEffect, useRef, useState } from 'react'

interface AvatarCropperProps {
  file?: File | null
  onChange?: (previewDataUrl: string) => void
  onExport?: (blob: Blob, dataUrl: string) => void
  size?: number
}

export default function AvatarCropper({ file, onChange, onExport, size = 240 }: AvatarCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!file) { setImg(null); draw(); return }
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => setImg(image)
      image.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }, [file])

  useEffect(() => { draw() }, [img, scale, offset])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = size
    canvas.height = size
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, size, size)
    if (img) {
      const iw = img.width, ih = img.height
      const base = Math.max(size / iw, size / ih)
      const s = base * scale
      const dw = iw * s, dh = ih * s
      const dx = (size - dw) / 2 + offset.x
      const dy = (size - dh) / 2 + offset.y
      ctx.drawImage(img, dx, dy, dw, dh)
    }
    const url = canvas.toDataURL('image/png')
    onChange?.(url)
  }

  function handleMouseDown(e: React.MouseEvent) { setDragging(true); setLastPos({ x: e.clientX, y: e.clientY }) }
  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging || !lastPos) return
    const dx = e.clientX - lastPos.x, dy = e.clientY - lastPos.y
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    setLastPos({ x: e.clientX, y: e.clientY })
  }
  function handleMouseUp() { setDragging(false); setLastPos(null) }

  async function exportBlob() {
    const canvas = canvasRef.current
    if (!canvas) return
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    const url = canvas.toDataURL('image/png')
    onExport?.(blob, url)
  }

  return (
    <div className="space-y-3">
      <div className="relative w-[240px] h-[240px] rounded-md overflow-hidden border border-gray-200 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">缩放</label>
        <input type="range" min={1} max={3} step={0.01} value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
        <button type="button" onClick={exportBlob} className="px-3 py-1.5 text-sm rounded-md bg-cyan-600 text-white hover:bg-cyan-700">应用裁剪</button>
      </div>
    </div>
  )
}