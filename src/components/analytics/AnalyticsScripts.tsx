import Script from 'next/script'
import {
  gtmEnabled,
  gtmId,
  metaPixelEnabled,
  metaPixelId,
} from '@/lib/analytics-env'

export function AnalyticsScripts() {
  if (!gtmEnabled) return null

  const consentDefaultAndGtm = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      wait_for_update: 500
    });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', true);
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `

  return (
    <Script
      id="gtm-consent-default-and-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: consentDefaultAndGtm }}
    />
  )
}

export function AnalyticsNoscript() {
  if (!gtmEnabled) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

export function MetaPixelScript() {
  if (!metaPixelEnabled) return null

  const metaPixel = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('consent', 'revoke');
    fbq('init', '${metaPixelId}');
    fbq('track', 'PageView');
  `

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: metaPixel }}
    />
  )
}

export function MetaPixelNoscript() {
  if (!metaPixelEnabled) return null

  return (
    <noscript>
      <img
        height="1"
        width="1"
        alt=""
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
      />
    </noscript>
  )
}
