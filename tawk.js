(function () {
  var config = window.RENIDY_FUNERALS_CONFIG || {};
  var STORAGE_PREFIX = "renidyfunerals_";
  var PASSCODE_KEY = "renidyfunerals_passcode_ok";
  var loaded = false;

  function safeJsonParse(value) {
    try {
      return value ? JSON.parse(value) : {};
    } catch (_) {
      return {};
    }
  }

  function hasAccess() {
    try {
      return localStorage.getItem(PASSCODE_KEY) === "true";
    } catch (_) {
      return false;
    }
  }

  function getAttribution() {
    var attribution = safeJsonParse(localStorage.getItem(STORAGE_PREFIX + "attribution"));
    attribution.page_location = window.location.href;
    attribution.page_path = window.location.pathname;
    attribution.site_domain = window.location.hostname;
    attribution.source_domain = config.siteDomain || "renidyfunerals.com";
    attribution.funnel_variant = attribution.funnel_variant || config.funnelVariant || "renidyfunerals_standalone";
    return attribution;
  }

  function getTawkAttributes() {
    var attribution = getAttribution();
    var allowedKeys = [
      "site_domain",
      "source_domain",
      "funnel_variant",
      "landing_page",
      "initial_referrer",
      "analytics_session_id",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "utm_id",
      "gclid",
      "gbraid",
      "wbraid",
      "msclkid",
      "fbclid",
      "page_path",
      "page_location",
    ];
    return allowedKeys.reduce(function (attrs, key) {
      var value = attribution[key];
      if (value !== undefined && value !== null && String(value) !== "") {
        attrs[key] = String(value).slice(0, 255);
      }
      return attrs;
    }, {});
  }

  function setTawkAttributes() {
    if (!window.Tawk_API || typeof window.Tawk_API.setAttributes !== "function") return;
    window.Tawk_API.setAttributes(getTawkAttributes(), function () {});
  }

  function loadTawk() {
    if (loaded || !config.tawkPropertyId || !config.tawkWidgetId || !hasAccess()) return;
    loaded = true;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    var previousOnLoad = window.Tawk_API.onLoad;
    window.Tawk_API.onLoad = function () {
      if (typeof previousOnLoad === "function") previousOnLoad();
      setTawkAttributes();
    };

    var script = document.createElement("script");
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    script.src =
      "https://embed.tawk.to/" +
      encodeURIComponent(config.tawkPropertyId) +
      "/" +
      encodeURIComponent(config.tawkWidgetId);

    var firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  window.RENIDY_FUNERALS_LOAD_TAWK = loadTawk;

  window.addEventListener("renidyfunerals:access-granted", loadTawk);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTawk);
  } else {
    loadTawk();
  }
})();
