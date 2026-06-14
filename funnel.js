(function () {
  var config = window.RENIDY_FUNERALS_CONFIG || {};
  var storagePrefix = "renidyfunerals_";

  function track(eventName, properties) {
    if (typeof window.RENIDY_FUNERALS_TRACK === "function") {
      window.RENIDY_FUNERALS_TRACK(eventName, properties);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, properties || {}));
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function collectForm(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = String(value).trim();
    });
    return data;
  }

  function setStep(flow, step) {
    flow.querySelectorAll("[data-step]").forEach(function (node) {
      node.classList.toggle("active", node.getAttribute("data-step") === String(step));
    });
    flow.querySelectorAll("[data-progress-step]").forEach(function (node) {
      var progressStep = Number(node.getAttribute("data-progress-step"));
      node.classList.toggle("active", progressStep <= Number(step || 3));
    });
    flow.setAttribute("data-current-step", String(step));
    flow.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function persistLead(payload) {
    try {
      sessionStorage.setItem(storagePrefix + "latest_lead", JSON.stringify(payload));
    } catch (_) {}
  }

  function postLead(payload) {
    if (!config.leadEndpoint) return Promise.resolve(false);
    return fetch(config.leadEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function () {
        return true;
      })
      .catch(function () {
        return fetch(config.leadEndpoint, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(payload),
        }).then(function () {
          return true;
        });
      })
      .catch(function () {
        return false;
      });
  }

  function setupFlow(flow) {
    var intent = flow.getAttribute("data-funnel-intent") || getParams().get("intent") || "";
    var selectedNeed = getParams().get("need") || "";
    var form = flow.querySelector("[data-funnel-form]");

    track("funnel_start", {
      source: "funnel_page",
      intent: intent,
      funnel_intent: intent,
      skipped_triage: "true",
    });

    flow.querySelectorAll("[data-funnel-option]").forEach(function (button) {
      var option = button.getAttribute("data-funnel-option") || "";
      button.classList.toggle("selected", selectedNeed === option);
      button.addEventListener("click", function () {
        selectedNeed = option;
        flow.querySelectorAll("[data-funnel-option]").forEach(function (node) {
          node.classList.toggle("selected", node === button);
        });
        track("funnel_need_selected", {
          intent: intent,
          funnel_intent: intent,
          selected_needs: selectedNeed,
        });
        setStep(flow, 2);
      });
    });

    flow.querySelectorAll("[data-funnel-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        track("funnel_details_continue", {
          intent: intent,
          funnel_intent: intent,
          selected_needs: selectedNeed,
        });
        setStep(flow, 3);
      });
    });

    flow.querySelectorAll("[data-funnel-back]").forEach(function (button) {
      button.addEventListener("click", function () {
        var currentStep = Number(flow.getAttribute("data-current-step") || "1");
        setStep(flow, Math.max(1, currentStep - 1));
      });
    });

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;

        var formData = collectForm(form);
        var payload = Object.assign({}, formData, {
          intent: intent,
          funnel_intent: intent,
          selected_needs: selectedNeed,
          page_location: window.location.href,
          submitted_at: new Date().toISOString(),
        });

        persistLead(payload);
        track("lead_captured", {
          intent: intent,
          funnel_intent: intent,
          selected_needs: selectedNeed,
          has_email: formData.email ? "true" : "false",
          has_phone: formData.phone ? "true" : "false",
          lead_endpoint_configured: config.leadEndpoint ? "true" : "false",
        });

        postLead(payload).then(function (sent) {
          track("lead_handoff", {
            intent: intent,
            funnel_intent: intent,
            selected_needs: selectedNeed,
            lead_endpoint_configured: config.leadEndpoint ? "true" : "false",
            lead_sent: sent ? "true" : "false",
          });
          setStep(flow, "success");
        });
      });
    }

    if (selectedNeed) {
      flow.querySelectorAll("[data-funnel-option]").forEach(function (button) {
        button.classList.toggle("selected", button.getAttribute("data-funnel-option") === selectedNeed);
      });
      setStep(flow, 2);
    } else {
      setStep(flow, 1);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-funnel-flow]").forEach(setupFlow);
  });
})();
