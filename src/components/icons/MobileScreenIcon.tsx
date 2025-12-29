import { SVGProps } from 'react'
const MobileScreenIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={20}
    height={24}
    viewBox='0 0 20 24'
    fill='none'
    {...props}
  >
    <path
      stroke='#062E25'
      strokeWidth={1.5}
      d='M.75 9.55c0-4.148 0-6.223 1.289-7.511C3.327.75 5.402.75 9.55.75s6.223 0 7.511 1.289C18.35 3.327 18.35 5.402 18.35 9.55v4.4c0 4.148 0 6.223-1.289 7.511-1.288 1.289-3.363 1.289-7.511 1.289s-6.223 0-7.511-1.289C.75 20.173.75 18.098.75 13.95v-4.4Z'
      opacity={0.8}
    />
    <path
      stroke='#062E25'
      strokeLinecap='round'
      strokeWidth={1.5}
      d='M12.85 19.45h-6.6'
      opacity={0.8}
    />
  </svg>
)
export default MobileScreenIcon
