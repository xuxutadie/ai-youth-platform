'use client'

import { useEffect, useState } from 'react'

type Props = {
  src: string
  className?: string
  controls?: boolean
}

export default function VideoPoster({ src, className, controls = true }: Props) {
  const [poster, setPoster] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const v = document.createElement('video')
    const canvas = document.createElement('canvas')
    v.crossOrigin = 'anonymous'
    v.src = src
    v.preload = 'auto'
    v.muted = true
    v.playsInline = true

    const onLoadedMeta = () => {
      try {
        const vw = v.videoWidth || 400
        const vh = v.videoHeight || 300
        const targetW = 400
        const targetH = Math.round((vh / vw) * targetW)
        canvas.width = targetW
        canvas.height = targetH
        const snapshotTime = Math.min(0.2, v.duration ? Math.max(0.05, v.duration * 0.02) : 0.2)
        v.currentTime = snapshotTime
      } catch {
        // ignore
      }
    }

    const onSeeked = () => {
      try {
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg')
        if (!cancelled) setPoster(dataUrl)
      } catch {
        // likely CORS restriction, keep placeholder
      }
    }

    v.addEventListener('loadedmetadata', onLoadedMeta)
    v.addEventListener('seeked', onSeeked)
    v.addEventListener('error', () => {
      // keep placeholder
    })

    return () => {
      cancelled = true
      v.removeEventListener('loadedmetadata', onLoadedMeta)
      v.removeEventListener('seeked', onSeeked)
    }
  }, [src])

  const fallbackPoster = `https://picsum.photos/seed/${encodeURIComponent(src)}/400/300`

  return (
    <video
      src={src}
      preload="none"
      controls={controls}
      className={className}
      poster={poster || fallbackPoster}
    />
  )
}