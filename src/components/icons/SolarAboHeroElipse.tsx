import * as React from 'react'
import { SVGProps } from 'react'
const SolarAboHeroElipse = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={602}
    height={602}
    fill="none"
    {...props}
  >
    <g filter="url(#a)">
      <circle cx={301} cy={301} r={121} fill="#B7FE1A" fillOpacity={0.3} />
    </g>
    <defs>
      <filter
        id="a"
        width={602}
        height={602}
        x={0}
        y={0}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur
          result="effect1_foregroundBlur_957_1051"
          stdDeviation={90}
        />
      </filter>
    </defs>
  </svg>
)
export default SolarAboHeroElipse
