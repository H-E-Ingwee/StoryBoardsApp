import React from 'react';

export function StoryAILogo({ className = 'w-10 h-10' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M50 15 L50 28 M30 22 L38 32 M70 22 L62 32 M18 38 L28 42 M82 38 L72 42"
        stroke="#F27D16"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M50 35 L72 65 L60 80 L40 80 L28 65 Z" fill="#032940" />
      <circle cx="50" cy="58" r="4" fill="#FFFFFF" />
      <path d="M50 35 L50 54" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M38 82 L62 82 L62 95 L38 95 Z" fill="#730E20" />
      <path d="M36 80 L64 80 L64 85 L36 85 Z" fill="#730E20" />
    </svg>
  );
}

