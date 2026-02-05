export default function VideoSection() {
  return (
    <section className="relative w-full py-12 bg-white overflow-hidden max-w-[1200px] mx-auto rounded-2xl">
      <div className="relative w-full h-[474px] rounded-2xl overflow-hidden">
        <video
          src="/videos/video-solar-abo-example.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </section>
  )
}
