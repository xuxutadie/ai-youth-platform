'use client'

import { useEffect, useState } from 'react'

type Props = {
  src?: string
  alt?: string
  className?: string
  fallbackSrc?: string
  // 裁剪关注模式；none 表示不裁剪
  focus?: 'none' | 'auto' | 'top' | 'left' | 'topLeft' | 'center'
  width?: number
  height?: number
}

export default function LogoImage({ src, alt = '青少年人工智能', className, fallbackSrc = '/logo.svg', focus = 'topLeft', width, height }: Props) {
  const [displaySrc, setDisplaySrc] = useState<string>(src || fallbackSrc)

  useEffect(() => {
    const url = src || fallbackSrc
    if (!url) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url

    img.onload = () => {
      try {
        const w = img.width
        const h = img.height
        if (w === 0 || h === 0) {
          setDisplaySrc(url)
          return
        }

        // 关闭裁剪：直接显示原图
        if (focus === 'none') {
          setDisplaySrc(url)
          return
        }

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setDisplaySrc(url)
          return
        }

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, w, h)
        const data = imageData.data

        let top = h, left = w, right = 0, bottom = 0
        const threshold = 250 // 近白阈值

        // 设定关注区域，以尽量忽略底部横幅等元素
        const region = (() => {
          if (focus === 'topLeft') {
            return { x0: 0, y0: 0, x1: Math.floor(w * 0.6), y1: Math.floor(h * 0.6) }
          } else if (focus === 'top') {
            return { x0: 0, y0: 0, x1: w, y1: Math.floor(h * 0.6) }
          } else if (focus === 'left') {
            return { x0: 0, y0: 0, x1: Math.floor(w * 0.6), y1: h }
          } else if (focus === 'center') {
            // 居中区域（覆盖 80%）：适度避免极端边缘噪点
            return { x0: Math.floor(w * 0.1), y0: Math.floor(h * 0.1), x1: Math.ceil(w * 0.9), y1: Math.ceil(h * 0.9) }
          } else {
            // auto 或其他：全图范围
            return { x0: 0, y0: 0, x1: w, y1: h }
          }
        })()

        for (let y = region.y0; y < region.y1; y++) {
          for (let x = region.x0; x < region.x1; x++) {
            const idx = (y * w + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]
            const a = data[idx + 3]
            const isWhite = a > 0 && r >= threshold && g >= threshold && b >= threshold
            if (!isWhite && a > 0) {
              if (x < left) left = x
              if (x > right) right = x
              if (y < top) top = y
              if (y > bottom) bottom = y
            }
          }
        }

        if (right > left && bottom > top) {
          const cropW = right - left + 1
          const cropH = bottom - top + 1
          const canvas2 = document.createElement('canvas')
          canvas2.width = cropW
          canvas2.height = cropH
          const ctx2 = canvas2.getContext('2d')
          if (!ctx2) {
            setDisplaySrc(url)
            return
          }
          ctx2.drawImage(img, left, top, cropW, cropH, 0, 0, cropW, cropH)
          const dataUrl = canvas2.toDataURL('image/png')
          setDisplaySrc(dataUrl)
        } else {
          setDisplaySrc(url)
        }
      } catch {
        setDisplaySrc(url)
      }
    }

    img.onerror = () => {
      setDisplaySrc(fallbackSrc)
    }
  }, [src, fallbackSrc, focus])

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
      onError={(e) => {
        e.currentTarget.onerror = null
        e.currentTarget.src = fallbackSrc
      }}
    />
  )
}