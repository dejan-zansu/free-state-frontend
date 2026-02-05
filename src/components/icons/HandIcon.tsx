import { SVGProps } from 'react'

const HandIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={69}
    height={62}
    viewBox="0 0 69 62"
    fill="none"
    {...props}
  >
    <g stroke="currentColor" strokeWidth={1.5} filter="url(#a)">
      <path
        strokeLinecap="round"
        d="M17.75 43.265h5.317c2.379 0 4.783.255 7.098.748 4.095.87 8.406.976 12.543.285 2.04-.341 4.044-.862 5.86-1.766 1.638-.817 3.645-1.967 4.994-3.256 1.346-1.287 2.748-3.394 3.743-5.04.853-1.412.44-3.144-.91-4.196-1.498-1.168-3.723-1.168-5.222 0l-4.253 3.316c-1.648 1.285-3.448 2.468-5.592 2.82-.258.043-.528.082-.81.116m0 0-.258.029m.258-.03c.343-.075.684-.293 1.003-.581 1.514-1.364 1.61-3.661.296-5.184a4.5 4.5 0 0 0-1.057-.892c-6.582-4.052-16.823-.965-23.01 3.563m22.768 3.095a1.191 1.191 0 0 1-.258.029m0 0a21.15 21.15 0 0 1-4.27.008"
      />
      <rect width={7} height={19} x={10.75} y={27.75} rx={1.5} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m38.75 6.75-5 7h7l-5 7"
      />
    </g>
    <defs>
      <filter
        id="a"
        width={68.501}
        height={61.5}
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
          result="effect1_dropShadow_998_4050"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_998_4050"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default HandIcon
