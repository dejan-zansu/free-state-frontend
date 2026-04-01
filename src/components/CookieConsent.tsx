'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

const translations: Record<string, CookieConsent.Translation> = {
  en: {
    consentModal: {
      title: 'We use cookies',
      description:
        'We use cookies to ensure the basic functionality of the website and to enhance your online experience. You can choose to opt in or out of each category whenever you want.',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Reject all',
      showPreferencesBtn: 'Manage preferences',
    },
    preferencesModal: {
      title: 'Cookie Preferences',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Reject all',
      savePreferencesBtn: 'Save preferences',
      closeIconLabel: 'Close',
      sections: [
        {
          title: 'Strictly Necessary Cookies',
          description:
            'These cookies are essential for the website to function properly and cannot be disabled.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Analytics Cookies',
          description:
            'These cookies collect information about how you use the website, which pages you visit and which links you click on.',
          linkedCategory: 'analytics',
        },
        {
          title: 'Marketing Cookies',
          description:
            'These cookies are used to deliver advertisements more relevant to you and your interests.',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
  de: {
    consentModal: {
      title: 'Wir verwenden Cookies',
      description:
        'Wir verwenden Cookies, um die grundlegende Funktionalität der Website sicherzustellen und Ihr Online-Erlebnis zu verbessern. Sie können jederzeit für jede Kategorie entscheiden, ob Sie diese zulassen oder ablehnen möchten.',
      acceptAllBtn: 'Alle akzeptieren',
      acceptNecessaryBtn: 'Alle ablehnen',
      showPreferencesBtn: 'Einstellungen verwalten',
    },
    preferencesModal: {
      title: 'Cookie-Einstellungen',
      acceptAllBtn: 'Alle akzeptieren',
      acceptNecessaryBtn: 'Alle ablehnen',
      savePreferencesBtn: 'Einstellungen speichern',
      closeIconLabel: 'Schliessen',
      sections: [
        {
          title: 'Notwendige Cookies',
          description:
            'Diese Cookies sind für die ordnungsgemässe Funktion der Website unerlässlich und können nicht deaktiviert werden.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Analyse-Cookies',
          description:
            'Diese Cookies sammeln Informationen darüber, wie Sie die Website nutzen, welche Seiten Sie besuchen und auf welche Links Sie klicken.',
          linkedCategory: 'analytics',
        },
        {
          title: 'Marketing-Cookies',
          description:
            'Diese Cookies werden verwendet, um Ihnen relevantere Werbung und Angebote zu präsentieren.',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
  fr: {
    consentModal: {
      title: 'Nous utilisons des cookies',
      description:
        "Nous utilisons des cookies pour assurer le fonctionnement de base du site web et améliorer votre expérience en ligne. Vous pouvez choisir d'accepter ou de refuser chaque catégorie à tout moment.",
      acceptAllBtn: 'Tout accepter',
      acceptNecessaryBtn: 'Tout refuser',
      showPreferencesBtn: 'Gérer les préférences',
    },
    preferencesModal: {
      title: 'Préférences des cookies',
      acceptAllBtn: 'Tout accepter',
      acceptNecessaryBtn: 'Tout refuser',
      savePreferencesBtn: 'Enregistrer les préférences',
      closeIconLabel: 'Fermer',
      sections: [
        {
          title: 'Cookies strictement nécessaires',
          description:
            'Ces cookies sont essentiels au bon fonctionnement du site web et ne peuvent pas être désactivés.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Cookies analytiques',
          description:
            "Ces cookies collectent des informations sur la façon dont vous utilisez le site web, les pages que vous visitez et les liens sur lesquels vous cliquez.",
          linkedCategory: 'analytics',
        },
        {
          title: 'Cookies marketing',
          description:
            'Ces cookies sont utilisés pour vous proposer des publicités et des offres plus pertinentes.',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
  it: {
    consentModal: {
      title: 'Utilizziamo i cookie',
      description:
        'Utilizziamo i cookie per garantire le funzionalità di base del sito web e per migliorare la tua esperienza online. Puoi scegliere di accettare o rifiutare ogni categoria in qualsiasi momento.',
      acceptAllBtn: 'Accetta tutti',
      acceptNecessaryBtn: 'Rifiuta tutti',
      showPreferencesBtn: 'Gestisci preferenze',
    },
    preferencesModal: {
      title: 'Preferenze cookie',
      acceptAllBtn: 'Accetta tutti',
      acceptNecessaryBtn: 'Rifiuta tutti',
      savePreferencesBtn: 'Salva preferenze',
      closeIconLabel: 'Chiudi',
      sections: [
        {
          title: 'Cookie strettamente necessari',
          description:
            'Questi cookie sono essenziali per il corretto funzionamento del sito web e non possono essere disattivati.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Cookie analitici',
          description:
            'Questi cookie raccolgono informazioni su come utilizzi il sito web, quali pagine visiti e quali link clicchi.',
          linkedCategory: 'analytics',
        },
        {
          title: 'Cookie di marketing',
          description:
            'Questi cookie vengono utilizzati per mostrarti pubblicità e offerte più pertinenti.',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
  es: {
    consentModal: {
      title: 'Usamos cookies',
      description:
        'Utilizamos cookies para garantizar la funcionalidad básica del sitio web y mejorar su experiencia en línea. Puede optar por aceptar o rechazar cada categoría en cualquier momento.',
      acceptAllBtn: 'Aceptar todas',
      acceptNecessaryBtn: 'Rechazar todas',
      showPreferencesBtn: 'Gestionar preferencias',
    },
    preferencesModal: {
      title: 'Preferencias de cookies',
      acceptAllBtn: 'Aceptar todas',
      acceptNecessaryBtn: 'Rechazar todas',
      savePreferencesBtn: 'Guardar preferencias',
      closeIconLabel: 'Cerrar',
      sections: [
        {
          title: 'Cookies estrictamente necesarias',
          description:
            'Estas cookies son esenciales para el correcto funcionamiento del sitio web y no se pueden desactivar.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Cookies analíticas',
          description:
            'Estas cookies recopilan información sobre cómo utiliza el sitio web, qué páginas visita y en qué enlaces hace clic.',
          linkedCategory: 'analytics',
        },
        {
          title: 'Cookies de marketing',
          description:
            'Estas cookies se utilizan para mostrarle anuncios y ofertas más relevantes.',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
  sr: {
    consentModal: {
      title: 'Koristimo kolačiće',
      description:
        'Koristimo kolačiće kako bismo osigurali osnovnu funkcionalnost sajta i poboljšali vaše iskustvo. Možete odabrati da prihvatite ili odbijete svaku kategoriju u bilo kom trenutku.',
      acceptAllBtn: 'Prihvati sve',
      acceptNecessaryBtn: 'Odbij sve',
      showPreferencesBtn: 'Podešavanja',
    },
    preferencesModal: {
      title: 'Podešavanja kolačića',
      acceptAllBtn: 'Prihvati sve',
      acceptNecessaryBtn: 'Odbij sve',
      savePreferencesBtn: 'Sačuvaj podešavanja',
      closeIconLabel: 'Zatvori',
      sections: [
        {
          title: 'Neophodni kolačići',
          description:
            'Ovi kolačići su neophodni za pravilno funkcionisanje sajta i ne mogu se isključiti.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Analitički kolačići',
          description:
            'Ovi kolačići prikupljaju informacije o tome kako koristite sajt, koje stranice posećujete i na koje linkove klikćete.',
          linkedCategory: 'analytics',
        },
        {
          title: 'Marketing kolačići',
          description:
            'Ovi kolačići se koriste za prikazivanje relevantnijih reklama i ponuda.',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
}

export default function CookieConsentBanner() {
  const locale = useLocale()

  useEffect(() => {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'box inline',
          position: 'bottom left',
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: '_gid' }],
          },
        },
        marketing: {
          autoClear: {
            cookies: [{ name: /^_fb/ }],
          },
        },
      },
      language: {
        default: 'de',
        translations,
      },
    })

    CookieConsent.setLanguage(locale)
  }, [locale])

  return null
}
