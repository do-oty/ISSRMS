import React from 'react'

/**
 * Reusable animated skeleton loading components
 * Styled for SJSM theme with subtle pulse animations.
 */

export function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[#EDE0D4]/60 rounded-xl ${className}`} />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-3 bg-[#EDE0D4]/70 rounded-md" 
          style={{ width: i === lines - 1 ? '60%' : '100%' }} 
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#EDE0D4] p-5 animate-pulse space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#EDE0D4]/70 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 bg-[#EDE0D4]/80 rounded-md w-1/3" />
          <div className="h-2.5 bg-[#EDE0D4]/60 rounded-md w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-3 bg-[#EDE0D4]/70 rounded-md w-full" />
        <div className="h-3 bg-[#EDE0D4]/70 rounded-md w-5/6" />
        <div className="h-3 bg-[#EDE0D4]/50 rounded-md w-2/3" />
      </div>
    </div>
  )
}

export function SkeletonTableRows({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="px-4 py-3.5">
              <div 
                className="h-3.5 bg-[#EDE0D4]/60 rounded-md" 
                style={{ width: `${Math.max(40, (75 - (cIdx * 8)))}%` }} 
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function SkeletonGrid({ count = 6, cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default {
  Box: SkeletonBox,
  Text: SkeletonText,
  Card: SkeletonCard,
  TableRows: SkeletonTableRows,
  Grid: SkeletonGrid
}
