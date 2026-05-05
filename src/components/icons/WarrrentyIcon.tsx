import * as React from 'react'
import { SVGProps } from 'react'

const WarrrentyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    {...props}
  >
    <circle cx={16} cy={16} r={15.5} fill="#B7FE1A" stroke="#295823" />
    <path
      stroke="#062E25"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.343}
      d="m14.462 16.6 1.038 1.162 2.595-2.907"
    />
    <path
      stroke="#062E25"
      strokeLinecap="round"
      strokeWidth={1.343}
      d="M9.74 15.16c0-2.324 0-3.486.274-3.877.274-.39 1.366-.764 3.55-1.512l.417-.142c1.139-.39 1.708-.585 2.297-.585.59 0 1.16.195 2.298.585l.416.142c2.185.748 3.277 1.122 3.551 1.512.274.391.274 1.553.274 3.876v1.144c0 1.82-.607 3.224-1.453 4.296M9.88 17.763c.623 3.123 3.185 4.732 4.873 5.469.524.229.786.343 1.526.343.741 0 1.003-.114 1.527-.343.42-.184.895-.421 1.38-.723"
    />
  </svg>
)
export default WarrrentyIcon
