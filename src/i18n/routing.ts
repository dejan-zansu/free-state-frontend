import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'de'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

export const routing = defineRouting({
  locales,
  defaultLocale,
  pathnames: {
    '/': '/',

    '/about-us': {
      en: '/about-us',
      de: '/ueber-uns',
      fr: '/a-propos',
      it: '/chi-siamo',
      es: '/sobre-nosotros',
      sr: '/o-nama',
    },
    '/contact': {
      en: '/contact',
      de: '/kontakt',
      fr: '/contact',
      it: '/contatto',
      es: '/contacto',
      sr: '/kontakt',
    },
    '/commercial/calculator': {
      en: '/commercial/calculator',
      de: '/gewerbe/rechner',
      fr: '/commercial/calculateur',
      it: '/commerciale/calcolatore',
      es: '/comercial/calculadora',
      sr: '/komercijalno/kalkulator',
    },
    '/how-it-works': {
      en: '/how-it-works',
      de: '/so-funktionierts',
      fr: '/comment-ca-marche',
      it: '/come-funziona',
      es: '/como-funciona',
      sr: '/kako-funkcionise',
    },
    '/portfolio': {
      en: '/portfolio',
      de: '/portfolio',
      fr: '/portfolio',
      it: '/portfolio',
      es: '/portfolio',
      sr: '/portfolio',
    },
    '/blog': {
      en: '/blog',
      de: '/blog',
      fr: '/blog',
      it: '/blog',
      es: '/blog',
      sr: '/blog',
    },
    '/blog/[slug]': {
      en: '/blog/[slug]',
      de: '/blog/[slug]',
      fr: '/blog/[slug]',
      it: '/blog/[slug]',
      es: '/blog/[slug]',
      sr: '/blog/[slug]',
    },
    '/battery-storage': {
      en: '/battery-storage',
      de: '/batteriespeicher',
      fr: '/stockage-batterie',
      it: '/accumulo-batteria',
      es: '/almacenamiento-bateria',
      sr: '/baterijska-skladista',
    },
    '/heat-pumps': {
      en: '/heat-pumps',
      de: '/waermepumpen',
      fr: '/pompes-a-chaleur',
      it: '/pompe-di-calore',
      es: '/bombas-de-calor',
      sr: '/toplotne-pumpe',
    },
    '/heat-pumps/how-it-works': {
      en: '/heat-pumps/how-it-works',
      de: '/waermepumpen/funktionsweise',
    },
    '/heat-pumps/cost': {
      en: '/heat-pumps/cost',
      de: '/waermepumpen/kosten',
    },
    '/heat-pumps/service': {
      en: '/heat-pumps/service',
      de: '/waermepumpen/service',
    },
    '/heat-pumps/heat-pumps-with-solar-system': {
      en: '/heat-pumps/heat-pumps-with-solar-system',
      de: '/waermepumpen/waermepumpen-mit-solaranlage',
    },
    '/heat-pumps/products': {
      en: '/heat-pumps/products',
      de: '/waermepumpen/produkte',
    },
    '/investors': {
      en: '/investors',
      de: '/investoren',
      fr: '/investisseurs',
      it: '/investitori',
      es: '/inversores',
      sr: '/investitori',
    },
    '/privacy-policy': {
      en: '/privacy-policy',
      de: '/datenschutz',
      fr: '/politique-de-confidentialite',
      it: '/politica-sulla-privacy',
      es: '/politica-de-privacidad',
      sr: '/politika-privatnosti',
    },
    '/solar-systems': {
      en: '/solar-systems',
      de: '/solaranlagen',
      fr: '/systemes-solaires',
      it: '/sistemi-solari',
      es: '/sistemas-solares',
      sr: '/solarni-sistemi',
    },

    // Auth pages
    '/login': {
      en: '/login',
      de: '/anmelden',
      fr: '/connexion',
      it: '/accedi',
      es: '/iniciar-sesion',
      sr: '/prijava',
    },
    '/register': {
      en: '/register',
      de: '/registrieren',
      fr: '/inscription',
      it: '/registrati',
      es: '/registrarse',
      sr: '/registracija',
    },
    '/dashboard': {
      en: '/dashboard',
      de: '/dashboard',
      fr: '/tableau-de-bord',
      it: '/pannello',
      es: '/panel',
      sr: '/kontrolna-tabla',
    },

    '/admin/dashboard': '/admin/dashboard',
    '/admin/users': '/admin/users',
    '/admin/leads': '/admin/leads',
    '/admin/contracts': '/admin/contracts',
    '/admin/equipment': '/admin/equipment',
    '/admin/equipment/manufacturers': '/admin/equipment/manufacturers',
    '/admin/equipment/solar-panels': '/admin/equipment/solar-panels',
    '/admin/equipment/inverters': '/admin/equipment/inverters',
    '/admin/equipment/batteries': '/admin/equipment/batteries',
    '/admin/equipment/mounting-systems': '/admin/equipment/mounting-systems',
    '/admin/equipment/ems': '/admin/equipment/ems',
    '/admin/equipment/heat-pumps': '/admin/equipment/heat-pumps',
    '/admin/equipment/packages': '/admin/equipment/packages',

    // Solar Free - Residential
    '/solar-free': {
      en: '/solar-free',
      de: '/solar-free',
      fr: '/abonnement-solaire',
      it: '/abbonamento-solare',
      es: '/suscripcion-solar',
      sr: '/solarni-abo',
    },
    '/solar-free/solar-free-home': {
      en: '/solar-free/solar-free-home',
      de: '/solar-free/solar-free-home',
      fr: '/abonnement-solaire/abonnement-maison',
      it: '/abbonamento-solare/abbonamento-casa',
      es: '/suscripcion-solar/suscripcion-hogar',
      sr: '/solarni-abo/solarni-abo-kuca',
    },
    '/solar-free/solar-free-home-battery': {
      en: '/solar-free/solar-free-home-battery',
      de: '/solar-free/solar-free-home-batterie',
      fr: '/abonnement-solaire/abonnement-maison-batterie',
      it: '/abbonamento-solare/abbonamento-casa-batteria',
      es: '/suscripcion-solar/suscripcion-hogar-bateria',
      sr: '/solarni-abo/solarni-abo-kuca-baterija',
    },
    '/solar-free/solar-free-multi': {
      en: '/solar-free/solar-free-multi',
      de: '/solar-free/solar-free-multi',
      fr: '/abonnement-solaire/abonnement-multi',
      it: '/abbonamento-solare/abbonamento-multi',
      es: '/suscripcion-solar/suscripcion-multi',
      sr: '/solarni-abo/solarni-abo-multi',
    },
    '/solar-free/solar-free-agro': {
      en: '/solar-free/solar-free-agro',
      de: '/solar-free/solar-free-agro',
      fr: '/abonnement-solaire/abonnement-agro',
      it: '/abbonamento-solare/abbonamento-agro',
      es: '/suscripcion-solar/suscripcion-agro',
      sr: '/solarni-abo/solarni-abo-agro',
    },
    '/solar-free/solar-free-public': {
      en: '/solar-free/solar-free-public',
      de: '/solar-free/solar-free-oeffentlich',
      fr: '/abonnement-solaire/abonnement-public',
      it: '/abbonamento-solare/abbonamento-pubblico',
      es: '/suscripcion-solar/suscripcion-publica',
      sr: '/solarni-abo/solarni-abo-javni',
    },
    '/solar-free/solar-free-business': {
      en: '/solar-free/solar-free-business',
      de: '/solar-free/solar-free-gewerbe',
      fr: '/abonnement-solaire/abonnement-entreprise',
      it: '/abbonamento-solare/abbonamento-azienda',
      es: '/suscripcion-solar/suscripcion-empresa',
      sr: '/solarni-abo/solarni-abo-biznis',
    },

    '/commercial': {
      en: '/commercial',
      de: '/gewerbe',
      fr: '/commercial',
      it: '/commerciale',
      es: '/comercial',
      sr: '/komercijalno',
    },
    '/commercial/solar-free': {
      en: '/commercial/solar-free',
      de: '/gewerbe/solar-free',
      fr: '/commercial/abonnement-solaire',
      it: '/commerciale/abbonamento-solare',
      es: '/comercial/suscripcion-solar',
      sr: '/komercijalno/solarni-abo',
    },
    '/commercial/solar-free/solar-free-business': {
      en: '/commercial/solar-free/solar-free-business',
      de: '/gewerbe/solar-free/solar-free-gewerbe',
      fr: '/commercial/abonnement-solaire/abonnement-entreprise',
      it: '/commerciale/abbonamento-solare/abbonamento-azienda',
      es: '/comercial/suscripcion-solar/suscripcion-empresa',
      sr: '/komercijalno/solarni-abo/solarni-abo-biznis',
    },
    '/commercial/solar-free/solar-free-agro': {
      en: '/commercial/solar-free/solar-free-agro',
      de: '/gewerbe/solar-free/solar-free-agro',
      fr: '/commercial/abonnement-solaire/abonnement-agro',
      it: '/commerciale/abbonamento-solare/abbonamento-agro',
      es: '/comercial/suscripcion-solar/suscripcion-agro',
      sr: '/komercijalno/solarni-abo/solarni-abo-agro',
    },
    '/commercial/solar-free/solar-free-public': {
      en: '/commercial/solar-free/solar-free-public',
      de: '/gewerbe/solar-free/solar-free-oeffentlich',
      fr: '/commercial/abonnement-solaire/abonnement-public',
      it: '/commerciale/abbonamento-solare/abbonamento-pubblico',
      es: '/comercial/suscripcion-solar/suscripcion-publica',
      sr: '/komercijalno/solarni-abo/solarni-abo-javni',
    },

    '/commercial/solar-systems': {
      en: '/commercial/solar-systems',
      de: '/gewerbe/solaranlagen',
    },
    '/commercial/solar-systems/how-large-plants-works': {
      en: '/commercial/solar-systems/how-large-plants-works',
      de: '/gewerbe/solaranlagen/wie-grossanlagen-funktionieren',
    },
    '/commercial/solar-systems/project-development': {
      en: '/commercial/solar-systems/project-development',
      de: '/gewerbe/solaranlagen/projektentwicklung',
    },
    '/commercial/solar-systems/solar-carport': {
      en: '/commercial/solar-systems/solar-carport',
      de: '/gewerbe/solaranlagen/solar-carport',
    },
    '/commercial/solar-systems/contracting': {
      en: '/commercial/solar-systems/contracting',
      de: '/gewerbe/solaranlagen/contracting',
    },
    '/commercial/charging-stations': {
      en: '/commercial/charging-stations',
      de: '/gewerbe/ladestationen',
    },
    '/commercial/charging-stations/apartment-building': {
      en: '/commercial/charging-stations/apartment-building',
      de: '/gewerbe/ladestationen/mehrfamilienhaus',
    },
    '/commercial/charging-stations/fast-charging-stations': {
      en: '/commercial/charging-stations/fast-charging-stations',
      de: '/gewerbe/ladestationen/schnellladestationen',
    },
    '/commercial/charging-stations/bidirectional-charging-station': {
      en: '/commercial/charging-stations/bidirectional-charging-station',
      de: '/gewerbe/ladestationen/bidirektionale-ladestation',
    },
    '/commercial/charging-stations/company': {
      en: '/commercial/charging-stations/company',
      de: '/gewerbe/ladestationen/unternehmen',
    },

    // Auth & user pages
    '/forgot-password': {
      en: '/forgot-password',
      de: '/passwort-vergessen',
    },
    '/set-password': {
      en: '/set-password',
      de: '/passwort-setzen',
    },
    '/verify-email': {
      en: '/verify-email',
      de: '/email-verifizieren',
    },
    '/terms': {
      en: '/terms',
      de: '/agb',
    },
    '/privacy': {
      en: '/privacy',
      de: '/datenschutz',
    },
    '/quotes': {
      en: '/quotes',
      de: '/angebote',
    },
    '/analytics': {
      en: '/analytics',
      de: '/analysen',
    },
    '/settings': {
      en: '/settings',
      de: '/einstellungen',
    },

    // Other pages
    '/products': {
      en: '/products',
      de: '/produkte',
    },
    '/learn-more': {
      en: '/learn-more',
      de: '/mehr-erfahren',
    },
    '/deals': {
      en: '/deals',
      de: '/angebote',
    },

    // Footer pages
    '/solar-free/single-family': {
      en: '/solar-free/single-family',
      de: '/solar-free/einfamilienhaus',
    },
    '/solar-free/multi-family': {
      en: '/solar-free/multi-family',
      de: '/solar-free/mehrfamilienhaus',
    },
    '/solar-free/businesses': {
      en: '/solar-free/businesses',
      de: '/solar-free/unternehmen',
    },
    '/solar-free/agriculture': {
      en: '/solar-free/agriculture',
      de: '/solar-free/landwirtschaft',
    },
    '/solar-free/public-buildings': {
      en: '/solar-free/public-buildings',
      de: '/solar-free/oeffentliche-gebaeude',
    },
    '/charging-stations': {
      en: '/charging-stations',
      de: '/ladestationen',
    },
    '/charging-stations/apartment-building': {
      en: '/charging-stations/apartment-building',
      de: '/ladestationen/mehrfamilienhaus',
    },
    '/charging-stations/single-family-home': {
      en: '/charging-stations/single-family-home',
      de: '/ladestationen/einfamilienhaus',
    },
    '/charging-stations/bidirectional-charging-station': {
      en: '/charging-stations/bidirectional-charging-station',
      de: '/ladestationen/bidirektionale-ladestation',
    },
    '/cost': {
      en: '/cost',
      de: '/kosten',
    },
    '/amortization': {
      en: '/amortization',
      de: '/amortisation',
    },
    '/solar-calculator': {
      en: '/solar-calculator',
      de: '/solarrechner',
    },
    '/solar-system-carport': {
      en: '/solar-system-carport',
      de: '/solaranlage-carport',
    },
    '/service': {
      en: '/service',
      de: '/service',
    },
    '/energy-storage': {
      en: '/energy-storage',
      de: '/stromspeicher',
    },
    '/repowering': {
      en: '/repowering',
      de: '/repowering',
    },
    '/energy-management': {
      en: '/energy-management',
      de: '/energiemanagement',
    },
    '/history': {
      en: '/history',
      de: '/geschichte',
    },
    '/mission': {
      en: '/mission',
      de: '/mission',
    },
    '/team': {
      en: '/team',
      de: '/team',
    },
    '/careers': {
      en: '/careers',
      de: '/karriere',
    },
    '/faq': {
      en: '/faq',
      de: '/faq',
    },
    '/media': {
      en: '/media',
      de: '/medien',
    },
    '/impressum': {
      en: '/impressum',
      de: '/impressum',
    },
    '/agb': {
      en: '/agb',
      de: '/agb',
    },
  },
})
