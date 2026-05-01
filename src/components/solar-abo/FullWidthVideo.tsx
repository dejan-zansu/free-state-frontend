interface FullWidthVideoProps {
  src: string
  poster?: string
}

const FullWidthVideo = ({ src, poster }: FullWidthVideoProps) => {
  return (
    <section className="w-full [&+*]:relative [&+*]:-mt-[40px] [&+*]:rounded-t-[40px] [&+*]:overflow-hidden">
      <video
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="w-full h-auto block"
      />
    </section>
  )
}

export default FullWidthVideo
