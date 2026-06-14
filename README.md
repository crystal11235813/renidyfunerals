# Renidy Funerals

Standalone static landing site for `renidyfunerals.com`.

This project intentionally does not live in the Renidy app repo and does not require the Renidy
Next.js app to deploy. CTAs stay on `renidyfunerals.com` so this domain can run standalone funnel
experiments without sending visitors into the main Renidy app.

The page mirrors the public Renidy landing-page visual system and section structure, while keeping
campaign-specific Renidy Funerals copy.

## Files

- `index.html` - landing page
- `need-help-now/index.html` - urgent/immediate-need funnel
- `planning-ahead/index.html` - planning-ahead funnel
- `styles.css` - responsive styling
- `assets/images/` - copied public Renidy landing-page imagery used by this standalone static site
- `config.js` - public analytics and handoff configuration
- `analytics.js` - UTM, click id, ValueTrack, GA4/GTM, and PostHog tracking
- `tawk.js` - Tawk.to chat loader and attribution handoff
- `robots.txt` and `sitemap.xml` - standalone domain crawl files

## Configure Analytics

Edit `config.js` before deployment:

```js
window.RENIDY_FUNERALS_CONFIG = {
  siteDomain: "renidyfunerals.com",
  funnelVariant: "renidyfunerals_standalone",
  defaultCtaUrl: "https://renidyfunerals.com/need-help-now/?intent=now",
  ga4Id: "G-XXXXXXX",
  gtmId: "GTM-XXXXXXX",
  posthogToken: "phc_...",
  posthogHost: "https://us.i.posthog.com",
  tawkPropertyId: "YOUR_TAWK_PROPERTY_ID",
  tawkWidgetId: "default",
  abEnabled: true,
  abExperimentId: "role_term_v1",
};
```

Use the same GA4, GTM, Google Ads conversion actions, and PostHog project as the control funnel if
you want clean A/B reporting in one place. Segment by:

- `site_domain`
- `source_domain`
- `funnel_variant`
- `ab_experiment_id`
- `variant`
- `role_variant`
- `role_term`
- `campaignid`
- `adgroupid`
- `creative`
- `keyword`
- `matchtype`
- `network`
- `device`

## Configure Tawk

Paste the Tawk property ID and widget ID from the Tawk install snippet into `config.js`.

The loader waits until the passcode gate is unlocked before loading chat, then sends available
campaign attribution into Tawk attributes:

- `site_domain`
- `source_domain`
- `funnel_variant`
- `utm_*`
- click IDs such as `gclid`, `gbraid`, `wbraid`, and `msclkid`
- `analytics_session_id`

## Funnel Pathing and A/B Test

Landing-page CTAs deep-link into the two standalone funnels:

- `?intent=now` opens `/need-help-now/`
- `?intent=ahead` opens `/planning-ahead/`

The role-word A/B test is `role_term_v1`. Visitors are split 50/50 between `guide` and `care`
unless a URL forces the variant with `?ab=guide` or `?ab=care`. The variant is persisted in
`localStorage`, copied onto outgoing CTA URLs, and included on tracked events as:

- `ab_experiment_id`
- `variant`
- `role_variant`
- `role_term`

## Google Ads Final URL Suffix

Use this on test ads that land on `https://renidyfunerals.com/`:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}&campaignid={campaignid}&adgroupid={adgroupid}&creative={creative}&keyword={keyword}&matchtype={matchtype}&network={network}&device={device}&placement={placement}&target={target}&loc_interest_ms={loc_interest_ms}&loc_physical_ms={loc_physical_ms}&funnel_variant=renidyfunerals_standalone
```

Keep Google Ads auto-tagging enabled so `gclid`, `gbraid`, and `wbraid` are appended.

## Deploy

Any static host works:

- Cloudflare Pages
- Netlify
- Vercel static project
- S3 + CloudFront
- GitHub Pages

Production is currently deployed from `main` through GitHub Pages for `renidyfunerals.com`.

## Local Preview

Open `index.html` directly in a browser, or run any simple static server from this directory.
