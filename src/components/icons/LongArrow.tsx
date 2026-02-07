import * as React from 'react'
const LongArrow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={37}
    height={8}
    fill="none"
    {...props}
  >
    <path
      fill="#FDFFF5"
      d="M36.854 4.035a.5.5 0 0 0 0-.707L33.672.146a.5.5 0 1 0-.707.707l2.828 2.829-2.828 2.828a.5.5 0 1 0 .707.707l3.182-3.182ZM0 3.682v.5h36.5v-1H0v.5Z"
    />
  </svg>
)
export default LongArrow
