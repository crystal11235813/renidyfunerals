# Renidy Funerals

Standalone static landing site for `renidyfunerals.com`.

This project intentionally does not live in the Renidy app repo and does not require the Renidy
Next.js app to deploy. CTAs can hand off to `renidy.com` with tracking parameters, similar to how a
separate campaign site can send qualified traffic into the main product.

The page mirrors the public Renidy landing-page visual system and section structure, while keeping
campaign-specific Renidy Funerals copy.

## Files

- `index.html` - landing page
- `styles.css` - responsive styling
- `assets/images/` - copied public Renidy landing-page imagery used by this standalone static site
- `config.js` - public analytics and handoff configuration
- `analytics.js` - UTM, click id, ValueTrack, GA4/GTM, and PostHog tracking
- `robots.txt` and `sitemap.xml` - standalone domain crawl files

## Configure Analytics

Edit `config.js` before deployment:

```js
window.RENIDY_FUNERALS_CONFIG = {
  siteDomain: "renidyfunerals.com",
  funnelVariant: "renidyfunerals_standalone",
  renidyBaseUrl: "https://www.renidy.com",
  defaultCtaUrl: "https://www.renidy.com/?booking=free",
  ga4Id: "G-XXXXXXX",
  gtmId: "GTM-XXXXXXX",
  posthogToken: "phc_...",
  posthogHost: "https://us.i.posthog.com",
};
```

Use the same GA4, GTM, Google Ads conversion actions, and PostHog project as the control funnel if
you want clean A/B reporting in one place. Segment by:

- `site_domain`
- `source_domain`
- `funnel_variant`
- `campaignid`
- `adgroupid`
- `creative`
- `keyword`
- `matchtype`
- `network`
- `device`

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

Point DNS for `renidyfunerals.com` at that host, not at the Renidy app deployment. As of the latest
check, the domain still points to Squarespace records, so DNS must be changed before this site can
go live.

## Local Preview

Open `index.html` directly in a browser, or run any simple static server from this directory.
