const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
    {...props}
  >
    <path
      stroke="#062E25"
      strokeWidth={1.5}
      d="M20.75 10.75c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10Z"
    />
    <path
      stroke="#062E25"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m8 13.75 5.5-6M13.75 13.5l-6-5.5"
    />
  </svg>
)
export default CloseIcon
