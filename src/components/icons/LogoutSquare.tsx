import * as React from 'react'
import { SVGProps } from 'react'
const LogoutSquare = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <path
      stroke="#062E25"
      strokeWidth={1.3}
      d="M1.84 8.833c0-3.297 0-4.945 1.024-5.97C3.89 1.84 5.537 1.84 8.834 1.84c3.296 0 4.944 0 5.968 1.024s1.024 2.672 1.024 5.969c0 3.296 0 4.945-1.024 5.969s-2.672 1.024-5.969 1.024c-3.296 0-4.944 0-5.969-1.024-1.024-1.024-1.024-2.673-1.024-5.97Z"
    />
    <path
      stroke="#062E25"
      strokeLinecap="round"
      strokeWidth={1.3}
      d="M5.18 8.853h5.135m0 0c0 .42-1.587 1.831-1.587 1.831m1.587-1.831c0-.43-1.587-1.814-1.587-1.814m3.813-1.154v5.889"
    />
  </svg>
)
export default LogoutSquare
