import Image from 'next/image'

const PricingSection = () => {
  return (
    <section className="relative">
      <Image
        src="/images/commercial/contracting/pricing-section.png"
        alt="Pricing"
        width={1440}
        height={560}
        className="w-full h-auto"
      />
    </section>
  )
}

export default PricingSection
