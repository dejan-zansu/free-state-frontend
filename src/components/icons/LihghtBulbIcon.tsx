import { SVGProps } from 'react'
const LightBulbIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={58}
    height={70}
    viewBox="0 0 58 70"
    fill="none"
    {...props}
  >
    <g stroke="currentColor" strokeWidth={1.5} filter="url(#a)">
      <path d="M34.75 48.733h-12m12 0c0-1.712 0-2.568.091-3.136.295-1.831.347-1.946 1.515-3.388.362-.446 1.707-1.65 4.397-4.058a17.945 17.945 0 0 0 5.997-13.408c0-9.937-8.059-17.993-18-17.993s-18 8.056-18 17.993a17.945 17.945 0 0 0 5.997 13.408c2.69 2.408 4.035 3.612 4.397 4.058 1.168 1.442 1.22 1.557 1.515 3.388.091.568.091 1.424.091 3.136m12 0c0 2.242 0 3.363-.482 4.198a3.6 3.6 0 0 1-1.318 1.318c-.835.482-1.957.482-4.2.482-2.243 0-3.365 0-4.2-.483a3.6 3.6 0 0 1-1.318-1.317c-.482-.835-.482-1.956-.482-4.198" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m30.75 22.743-5 6.997h7l-5 6.997"
      />
    </g>
    <defs>
      <filter
        id="a"
        width={57.5}
        height={69.481}
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
          result="effect1_dropShadow_998_4037"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_998_4037"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default LightBulbIcon
