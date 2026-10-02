import React, { useState } from 'react';

interface HospitalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const finalClass = `${sizeClasses[size]} ${className} object-contain rounded-full shadow-xs bg-white`;

  if (!hasError) {
    return (
      <img
        src="/src/assets/images/sangkhlaburi_logo_white_ring_1790828450081.jpg"
        alt="ตราสัญลักษณ์โรงพยาบาลสังขละบุรี"
        className={finalClass}
        onError={() => setHasError(true)}
      />
    );
  }

  // Exact vector SVG recreation matching uploaded Sangkhlaburi Hospital circular seal:
  // White outer ring with green text + solid green center circle with white winged caduceus torch
  return (
    <svg
      viewBox="0 0 200 200"
      className={finalClass}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer green double stroke and white background */}
      <circle cx="100" cy="100" r="97" fill="#FFFFFF" stroke="#0B663B" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="93" fill="none" stroke="#0B663B" strokeWidth="1" />
      
      {/* Inner solid green circle */}
      <circle cx="100" cy="100" r="66" fill="#0B663B" stroke="#0B663B" strokeWidth="1.5" />

      {/* Thai Text Arc Top in Deep Green */}
      <path id="svgTextPathTop" d="M 24,100 A 76,76 0 0,1 176,100" fill="none" />
      <text fill="#0B663B" fontSize="14" fontWeight="bold" letterSpacing="0.6">
        <textPath href="#svgTextPathTop" startOffset="50%" textAnchor="middle">
          โรงพยาบาลสังขละบุรี
        </textPath>
      </text>

      {/* Left Floral Ornament */}
      <g transform="translate(16, 100) scale(0.65) translate(-10, -10)" fill="#0B663B">
        <path d="M10,2 C12,6 18,10 10,18 C2,10 8,6 10,2 Z" />
        <circle cx="10" cy="10" r="2.5" fill="#FFFFFF" />
      </g>

      {/* Right Floral Ornament */}
      <g transform="translate(184, 100) scale(0.65) translate(-10, -10)" fill="#0B663B">
        <path d="M10,2 C12,6 18,10 10,18 C2,10 8,6 10,2 Z" />
        <circle cx="10" cy="10" r="2.5" fill="#FFFFFF" />
      </g>

      {/* English Text Arc Bottom in Deep Green */}
      <path id="svgTextPathBottom" d="M 176,100 A 76,76 0 0,1 24,100" fill="none" />
      <text fill="#0B663B" fontSize="9.5" fontWeight="bold" letterSpacing="1.2">
        <textPath href="#svgTextPathBottom" startOffset="50%" textAnchor="middle">
          SANGKHLABURI HOSPITAL
        </textPath>
      </text>

      {/* Center White Ministry of Public Health Emblem */}
      <g transform="translate(100, 100) scale(0.62) translate(-100, -100)">
        {/* Flames of Torch */}
        <path
          d="M 95 32 C 90 40, 94 48, 92 56 C 96 52, 98 48, 99 44 C 101 48, 104 53, 108 55 C 106 47, 110 40, 105 32 C 102 38, 100 37, 98 33 C 97 36, 96 35, 95 32 Z"
          fill="#FFFFFF"
        />
        {/* Torch Cup */}
        <path
          d="M 90 56 L 110 56 L 105 68 L 95 68 Z"
          fill="#FFFFFF"
        />
        <rect x="92" y="68" width="16" height="3" rx="1.5" fill="#FFFFFF" />

        {/* Wings Flared Left & Right */}
        <path
          d="M 52 75 C 68 56, 88 70, 92 78 C 84 83, 72 82, 52 75 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 148 75 C 132 56, 112 70, 108 78 C 116 83, 128 82, 148 75 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 62 82 C 74 74, 88 84, 94 88 C 86 92, 76 90, 62 82 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 138 82 C 126 74, 112 84, 106 88 C 114 92, 124 90, 138 82 Z"
          fill="#FFFFFF"
        />

        {/* Staff Shaft */}
        <rect x="97" y="70" width="6" height="84" rx="3" fill="#FFFFFF" />
        <polygon points="100,162 96,154 104,154" fill="#FFFFFF" />

        {/* Entwined Serpents Body with details */}
        <path
          d="M 80 88 C 88 98, 112 98, 120 108 C 112 118, 88 118, 80 128 C 88 138, 112 138, 120 148"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 120 88 C 112 98, 88 98, 80 108 C 88 118, 112 118, 120 128 C 112 138, 88 138, 80 148"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Serpent Heads */}
        <circle cx="78" cy="86" r="3.5" fill="#FFFFFF" />
        <circle cx="122" cy="86" r="3.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
