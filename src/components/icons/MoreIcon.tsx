import { SVGProps } from 'react'
const MoreIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <path
      stroke="#B7FE1A"
      strokeWidth={0.568}
      d="M12.5.284c6.76 0 12.216 5.227 12.216 11.648 0 6.42-5.457 11.647-12.216 11.647C5.74 23.58.284 18.352.284 11.932S5.741.284 12.5.284Z"
    />
    <path
      stroke="#B7FE1A"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M16.477 11.93H12.5m0 0H8.522m3.978 0V7.953m0 3.977v3.978"
    />
  </svg>
)
export default MoreIcon
