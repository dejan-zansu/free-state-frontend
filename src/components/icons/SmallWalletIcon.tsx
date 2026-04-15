import * as React from 'react'
import { SVGProps } from 'react'

type SmallWalletIconProps = SVGProps<SVGSVGElement> & {
  bgColor?: string
  fgColor?: string
}

const SmallWalletIcon = ({
  bgColor = '#b7fe1a',
  fgColor = '#062e25',
  ...props
}: SmallWalletIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={21}
    fill="none"
    {...props}
  >
    <ellipse cx={10.732} cy={10.5} fill={bgColor} rx={10.732} ry={10.5} />
    <path stroke={bgColor} strokeWidth={0.671} d="M11.924 14.943H9.092" />
    <path
      stroke={bgColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.671}
      d="m10.952 8.852-1.214 1.662h1.7l-1.214 1.663"
    />
    <path
      stroke={fgColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.894}
      d="M7.691 9.188h2.326"
    />
    <path
      stroke={fgColor}
      strokeWidth={0.894}
      d="M16.313 9.754H14.8c-1.037 0-1.878.764-1.878 1.706s.84 1.706 1.878 1.706h1.606c.313-.02.563-.246.584-.531l.001-.085v-2.18l-.001-.084c-.02-.285-.27-.512-.584-.53-.02-.002-.045-.002-.093-.002Z"
    />
    <path
      stroke={fgColor}
      strokeWidth={0.894}
      d="M16.39 9.754c-.046-1.065-.191-1.718-.661-2.178-.681-.666-1.777-.666-3.97-.666h-1.743c-2.193 0-3.289 0-3.97.666-.68.667-.68 1.74-.68 3.884s0 3.217.68 3.884c.681.666 1.777.666 3.97.666h1.743c2.193 0 3.289 0 3.97-.666.47-.46.615-1.113.66-2.178"
    />
    <path
      stroke={fgColor}
      strokeLinecap="round"
      strokeWidth={0.894}
      d="m7.691 6.911 2.172-1.408a1.92 1.92 0 0 1 2.051 0l2.172 1.408"
    />
    <path
      stroke={fgColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.894}
      d="M14.66 11.458h.005"
    />
  </svg>
)
export default SmallWalletIcon
