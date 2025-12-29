import Stats from '@/components/Stats'

const PortfolioHero = async () => {
  return (
    <section className='relative min-h-[879px] flex justify-center overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage: "url('/images/hero-solar-panels-2.png')",
          }}
        />
      </div>

      <div className='relative z-10 max-w-360 mx-auto px-6 pt-40 pb-16'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-foreground text-7xl font-medium mb-4 whitespace-pre-line'>
            Our solar projects <br /> across Switzerland
          </h1>
        </div>
      </div>

      {/* Stats at bottom with blur background */}
      <div className='absolute bottom-0 left-0 right-0 z-10'>
        <div
          className='w-full h-[189px] flex items-center'
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(32.5px)',
          }}
        >
          <div className='max-w-[1440px] mx-auto w-full px-6'>
            <div className='[&_*]:!text-white [&_.text-foreground]:!text-white [&_section]:!pb-0 [&_div[class*="bg-"]]:!bg-white/20'>
              <Stats />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PortfolioHero
