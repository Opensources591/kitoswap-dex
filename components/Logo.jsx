"use client"

export default function Logo({ className = "h-8 w-auto", showText = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* SVG Logo with stylized K and swap arrows */}
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="url(#logoGradient)"
          opacity="0.1"
          stroke="url(#logoGradient)"
          strokeWidth="2"
        />

        {/* Stylized K */}
        <path
          d="M12 8 L12 32 M12 20 L28 8 M12 20 L28 32"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Swap arrows */}
        <path
          d="M30 14 L34 18 L30 22"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M10 26 L6 22 L10 18"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          KitoSwap
        </span>
      )}
    </div>
  )
}
