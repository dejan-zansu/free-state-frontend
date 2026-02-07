import * as React from 'react'
import { SVGProps } from 'react'
const ShieldIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={34}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M.75 14.058c0-5.056 0-7.584.597-8.434.597-.85 2.974-1.664 7.728-3.292l.905-.31c2.479-.848 3.717-1.272 5-1.272s2.522.424 5 1.272l.906.31c4.754 1.628 7.131 2.441 7.728 3.292.597.85.597 3.378.597 8.434v2.49c0 8.915-6.703 13.24-10.908 15.078-1.14.498-1.711.747-3.323.747-1.611 0-2.182-.249-3.322-.747C7.452 29.789.75 25.463.75 16.548v-2.49Z"
      opacity={0.8}
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m11.027 17.185 2.259 2.53 5.645-6.323"
      opacity={0.8}
    />
  </svg>
)
export default ShieldIcon
