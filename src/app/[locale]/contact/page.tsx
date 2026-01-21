import Partners from '@/components/Partners'
import ContactFormSection from '@/components/ContactFormSection'
import ContactHero from '@/components/ContactHero'
import ContactStats from '@/components/ContactStats'
import ContactMap from '@/components/ContactMap'

const ContactPage = async () => {
  return (
    <div className='relative bg-background'>
      <ContactHero />
      <ContactStats />
      <ContactFormSection />
      <ContactMap />
      <Partners />
    </div>
  )
}

export default ContactPage
