import PageHero from '@/components/PageHero'
import { getTranslations } from 'next-intl/server'

const ProductsPage = async () => {
  const t = await getTranslations('products')

  return (
    <div>
      <PageHero
        title="Products"
        description="Products"
        backgroundImage="/images/solar-farm.png"
      />
    </div>
  )
}

export default ProductsPage
