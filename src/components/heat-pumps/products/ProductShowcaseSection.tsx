import Image from 'next/image'

const ProductShowcaseSection = () => {
  return (
    <section className="relative bg-[#EAEDDF]">
      <div className="pt-[50px]">
        <div className="relative w-full aspect-[1440/359]">
          <Image
            src="/images/heat-pumps/products/product-showcase.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default ProductShowcaseSection
