'use client'

import React from 'react'

type HighlightButtonProps = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function HighlightButton({ children, className = '', onClick }: HighlightButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-white shadow-md bg-gradient-to-br from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 transition-colors transition-shadow ${className}`}
    >
      {children}
    </button>
  )
}