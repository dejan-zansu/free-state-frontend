import * as React from "react"
import { SVGProps } from "react"
const SaleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={34}
    height={34}
    fill="none"
    {...props}
  >
    <g stroke="#062E25" strokeWidth={1.5} opacity={0.8}>
      <path d="M5.184 23.722c-2.512-2.511-3.767-3.767-4.235-5.396-.467-1.63-.068-3.36.731-6.82l.46-1.996c.672-2.912 1.008-4.368 2.005-5.365.997-.997 2.453-1.333 5.365-2.004l1.995-.461C14.966.881 16.697.482 18.326.95c1.63.467 2.885 1.722 5.396 4.234l2.974 2.973c4.37 4.37 6.554 6.554 6.554 9.27 0 2.714-2.185 4.899-6.554 9.269-4.37 4.37-6.555 6.554-9.27 6.554s-4.9-2.185-9.269-6.554l-2.973-2.974Z" />
      <circle
        cx={11.489}
        cy={11.928}
        r={3.25}
        transform="rotate(-45 11.489 11.928)"
      />
      <path strokeLinecap="round" d="M16.254 27.563 27.595 16.22" />
    </g>
  </svg>
)
export default SaleIcon
