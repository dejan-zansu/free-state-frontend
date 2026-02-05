import { SVGProps } from 'react'
const WalletIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={66}
    height={57}
    viewBox="0 0 66 57"
    fill="none"
    {...props}
  >
    <g
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      filter="url(#a)"
    >
      <path d="M55.081 22.269c-.02-6.904-.238-10.565-2.595-12.922C49.89 6.75 45.71 6.75 37.35 6.75h-8.867c-8.36 0-12.539 0-15.136 2.597-2.597 2.598-2.597 6.778-2.597 15.139 0 8.36 0 12.54 2.597 15.138 2.597 2.597 6.777 2.597 15.136 2.597h3.325" />
      <path
        strokeLinejoin="round"
        d="M40.675 28.92v13.302m0 0 4.433-4.434m-4.433 4.434-4.434-4.434m14.409 4.434V28.92m0 0 4.433 4.434M50.65 28.92l-4.434 4.434"
      />
      <path d="M28.483 33.353h-8.867M10.75 20.052h44.333" />
    </g>
    <defs>
      <filter
        id="a"
        width={65.834}
        height={56.972}
        x={0}
        y={0}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={4} />
        <feGaussianBlur stdDeviation={5} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0.717647 0 0 0 0 0.996078 0 0 0 0 0.101961 0 0 0 0.36 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_998_4072"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_998_4072"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default WalletIcon
