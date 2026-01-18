import { SVGProps } from 'react'

const BatteryIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={38}
    height={31}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={2}
      d="M1 15.341c0-6.76 0-10.14 2.1-12.24C5.2 1 8.58 1 15.341 1h2.689c6.76 0 10.14 0 12.24 2.1 2.1 2.1 2.1 5.48 2.1 12.241 0 6.76 0 10.14-2.1 12.24-2.1 2.1-5.48 2.1-12.24 2.1H15.34c-6.76 0-10.14 0-12.24-2.1C1 25.482 1 22.102 1 15.342Z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      d="M9.963 9.965s.896 1.613.896 5.378-.896 5.378-.896 5.378M16.238 9.965s.897 1.613.897 5.378-.897 5.378-.897 5.378M22.512 9.965s.896 1.613.896 5.378-.896 5.378-.896 5.378"
    />
    <path
      stroke="currentColor"
      strokeWidth={2}
      d="M33.268 11.754c1.69 0 2.535 0 3.06.525.525.525.525 1.37.525 3.06s0 2.535-.525 3.06c-.525.525-1.37.525-3.06.525v-7.17Z"
    />
  </svg>
)
export default BatteryIcon
