import SolarAboCard from './SolarAboCard'

const SolarSystemsIncludes = () => {
  const items = [
    {
      image: 'https://placehold.co/132x132/FFFFFF/062E25?text=☀️',
      title: 'Solar modules',
      subtitle: 'High-efficiency panels selected for your roof',
    },
    {
      image: 'https://placehold.co/132x132/FFFFFF/062E25?text=📐',
      title: 'System design & sizing',
      subtitle: 'Optimized layout based on your consumption',
    },
    {
      image: 'https://placehold.co/132x132/FFFFFF/062E25?text=🔧',
      title: 'Installation',
      subtitle: 'Handled end-to-end by our partners',
    },
    {
      image: 'https://placehold.co/132x132/FFFFFF/062E25?text=📊',
      title: 'Monitoring system',
      subtitle: 'Real-time tracking of your energy production',
    },
    {
      image: 'https://placehold.co/132x132/FFFFFF/062E25?text=🛡️',
      title: 'Maintenance & warranty',
      subtitle: 'Full service coverage and extended warranty',
    },
  ]

  return (
    <section className="relative py-16 sm:pt-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px]">
        {/* Header */}
        <div className="mb-12 sm:mb-14 max-w-[614px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1em] mb-5">
            What&apos;s included
          </h2>
          <p className="text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-[1.36em] tracking-[-0.02em]">
            In SolarAbo Systems
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
          {items.map((item, index) => (
            <SolarAboCard
              key={index}
              image={item.image}
              imageAlt={item.title}
              title={item.title}
              subtitle={item.subtitle}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolarSystemsIncludes
