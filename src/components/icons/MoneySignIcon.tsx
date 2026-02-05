import { SVGProps } from 'react'
const MoneySignIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={36}
    height={36}
    viewBox="0 0 36 36"
    fill="none"
    {...props}
  >
    <g stroke="currentColor" strokeWidth={1.5}>
      <circle cx={17.75} cy={17.75} r={17} />
      <path
        strokeLinecap="round"
        d="M17.75 26.25v1.7M17.75 7.55v1.7M22.848 13.5c0-2.347-2.283-4.25-5.1-4.25-2.816 0-5.1 1.903-5.1 4.25s2.284 4.25 5.1 4.25c2.817 0 5.1 1.903 5.1 4.25s-2.283 4.25-5.1 4.25c-2.816 0-5.1-1.903-5.1-4.25"
      />
    </g>
  </svg>
)
export default MoneySignIcon
