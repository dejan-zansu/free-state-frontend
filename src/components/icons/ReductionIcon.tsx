import { SVGProps } from 'react'
const ReductionIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={22}
    height={22}
    viewBox='0 0 22 22'
    fill='none'
    {...props}
  >
    <g stroke='#062E25' strokeWidth={1.5} opacity={0.8}>
      <path d='M.75 10.75c0-4.714 0-7.071 1.464-8.536C3.68.75 6.036.75 10.75.75c4.714 0 7.071 0 8.535 1.464C20.75 3.68 20.75 6.036 20.75 10.75c0 4.714 0 7.071-1.465 8.535-1.464 1.465-3.821 1.465-8.535 1.465s-7.071 0-8.536-1.465C.75 17.822.75 15.464.75 10.75Z' />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m5.75 8.75 2.293 2.293a1 1 0 0 0 1.414 0l1.586-1.586a1 1 0 0 1 1.414 0l3.293 3.293m0 0v-2.5m0 2.5h-2.5'
      />
    </g>
  </svg>
)
export default ReductionIcon
