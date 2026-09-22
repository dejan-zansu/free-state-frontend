import { LinkButton } from '@/components/ui/link-button'

export default function RatgeberCta() {
  return (
    <section className="bg-[#062E25] text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between md:py-20">
        <div>
          <h2 className="text-2xl font-semibold md:text-[38px]">
            Passt ein ZEV, vZEV oder eine LEG zu Ihrem Objekt?
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/85 md:text-lg">
            Adresse eingeben, Dach und Verbrauch angeben. Wir prüfen mit dem
            Netzbetreiber, welches Modell möglich ist, und melden uns mit einem
            Vorschlag.
          </p>
        </div>
        <LinkButton href="/commercial/calculator" variant="primary">
          Objekt prüfen lassen
        </LinkButton>
      </div>
    </section>
  )
}
