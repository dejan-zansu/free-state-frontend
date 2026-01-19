import Partners from '@/components/Partners'
import ContactFormSection from '@/components/ContactFormSection'
import ContactHero from '@/components/ContactHero'
import ContactStats from '@/components/ContactStats'

const ContactPage = async () => {
  return (
    <div className='relative bg-background'>
      <ContactHero />
      <ContactStats />
      <ContactFormSection />
      <Partners />
    </div>
  )
}

export default ContactPage
