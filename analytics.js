(function () {
  var config = window.RENIDY_FUNERALS_CONFIG || {};
  var siteDomain = config.siteDomain || "renidyfunerals.com";
  var funnelVariant = config.funnelVariant || "renidyfunerals_standalone";
  var storagePrefix = "renidyfunerals_";
  var utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"];
  var clickIdKeys = ["gclid", "gbraid", "wbraid", "msclkid", "dclid", "fbclid", "ttclid"];
  var adKeys = [
    "campaignid",
    "adgroupid",
    "creative",
    "keyword",
    "matchtype",
    "network",
    "device",
    "placement",
    "target",
    "targetid",
    "feeditemid",
    "loc_interest_ms",
    "loc_physical_ms",
    "adposition",
  ];

  function safeJsonParse(value) {
    try {
      return value ? JSON.parse(value) : {};
    } catch (_) {
      return {};
    }
  }

  function getSessionId() {
    var key = storagePrefix + "session_id";
    try {
      var existing = sessionStorage.getItem(key);
      if (existing) return existing;
      var generated =
        window.crypto && window.crypto.randomUUID
          ? window.crypto.randomUUID()
          : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
      sessionStorage.setItem(key, generated);
      return generated;
    } catch (_) {
      return "";
    }
  }

  function captureParams() {
    var params = new URLSearchParams(window.location.search);
    var attribution = safeJsonParse(localStorage.getItem(storagePrefix + "attribution"));
    utmKeys.concat(clickIdKeys, adKeys).forEach(function (key) {
      var value = params.get(key);
      if (value) attribution[key] = value;
    });

    attribution.site_domain = window.location.hostname;
    attribution.source_domain = siteDomain;
    attribution.funnel_variant = params.get("funnel_variant") || funnelVariant;
    attribution.landing_page = attribution.landing_page || window.location.pathname + window.location.search;
    attribution.initial_referrer = attribution.initial_referrer || document.referrer || "direct";
    attribution.analytics_session_id = getSessionId();

    try {
      localStorage.setItem(storagePrefix + "attribution", JSON.stringify(attribution));
    } catch (_) {}
    return attribution;
  }

  function getAttribution() {
    return Object.assign(
      {
        page_path: window.location.pathname,
        page_title: document.title,
        page_location: window.location.href,
        site_domain: window.location.hostname,
        source_domain: siteDomain,
        funnel_variant: funnelVariant,
        analytics_session_id: getSessionId(),
      },
      safeJsonParse(localStorage.getItem(storagePrefix + "attribution"))
    );
  }

  function loadScript(src, id) {
    if (id && document.getElementById(id)) return;
    var script = document.createElement("script");
    script.async = true;
    if (id) script.id = id;
    script.src = src;
    document.head.appendChild(script);
  }

  function setupGoogle() {
    window.dataLayer = window.dataLayer || [];
    if (config.gtmId) {
      window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(config.gtmId), "gtm");
    }
    if (config.ga4Id) {
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(config.ga4Id), "ga4");
      window.gtag =
        window.gtag ||
        function () {
          window.dataLayer.push(arguments);
        };
      window.gtag("js", new Date());
      window.gtag("config", config.ga4Id, { send_page_view: false });
    }
  }

  function setupPostHog() {
    if (!config.posthogToken) return;
    (function (t, e) {
      var o, n, p, r;
      e.__SV = 1;
      window.posthog = e;
      e._i = [];
      e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split(".");
          if (o.length === 2) {
            t = t[o[0]];
            e = o[1];
          }
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        p = t.createElement("script");
        p.type = "text/javascript";
        p.async = true;
        p.src = s.api_host + "/static/array.js";
        r = t.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(p, r);
        var u = e;
        if (a !== undefined) u = e[a] = [];
        else a = "posthog";
        u.people = u.people || [];
        u.toString = function (t) {
          var e = "posthog";
          if (a !== "posthog") e += "." + a;
          if (!t) e += " (stub)";
          return e;
        };
        u.people.toString = function () {
          return u.toString(1) + ".people (stub)";
        };
        o = "capture identify alias people.set people.set_once register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset".split(" ");
        for (n = 0; n < o.length; n++) g(u, o[n]);
        e._i.push([i, s, a]);
      };
    })(document, window.posthog || []);

    window.posthog.init(config.posthogToken, {
      api_host: config.posthogHost || "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      person_profiles: "identified_only",
    });
  }

  function track(eventName, properties) {
    var payload = Object.assign({}, getAttribution(), properties || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, payload));
    if (window.gtag) window.gtag("event", eventName, payload);
    if (window.posthog && window.posthog.capture) window.posthog.capture(eventName, payload);
  }

  function decorateUrl(rawUrl, ctaName, ctaLocation) {
    var url = new URL(rawUrl || config.defaultCtaUrl, window.location.href);
    var attribution = getAttribution();
    Object.keys(attribution).forEach(function (key) {
      var value = attribution[key];
      if (value !== undefined && value !== null && value !== "" && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    });
    url.searchParams.set("source_domain", siteDomain);
    url.searchParams.set("funnel_variant", funnelVariant);
    url.searchParams.set("cta_name", ctaName || "unknown");
    url.searchParams.set("cta_location", ctaLocation || "unknown");
    return url.toString();
  }

  function bindClicks() {
    document.querySelectorAll("[data-track-cta]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var ctaName = link.getAttribute("data-track-cta") || link.textContent.trim();
        var ctaLocation = link.getAttribute("data-track-location") || "unknown";
        var destination = decorateUrl(link.getAttribute("href"), ctaName, ctaLocation);
        track("cta_clicked", {
          cta_name: ctaName,
          cta_location: ctaLocation,
          destination_url: destination,
        });
        if (link.hostname && link.hostname !== window.location.hostname) {
          event.preventDefault();
          window.setTimeout(function () {
            window.location.href = destination;
          }, 120);
        } else {
          link.setAttribute("href", destination);
        }
      });
    });
  }

  captureParams();
  setupGoogle();
  setupPostHog();

  document.addEventListener("DOMContentLoaded", function () {
    var attribution = captureParams();
    if (window.posthog && window.posthog.register) window.posthog.register(getAttribution());
    track("funnel_landed", attribution);
    track("page_view", {});
    bindClicks();
  });
})();
