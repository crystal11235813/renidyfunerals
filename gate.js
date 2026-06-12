(function () {
  var PASSCODE = "1313113";
  var STORAGE_KEY = "renidyfunerals_passcode_ok";

  function hasAccess() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch (_) {
      return false;
    }
  }

  function grantAccess(gate) {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (_) {}
    document.documentElement.classList.remove("passcode-locked");
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
    try {
      window.dispatchEvent(new CustomEvent("renidyfunerals:access-granted"));
    } catch (_) {}
  }

  function renderGate() {
    if (hasAccess()) {
      document.documentElement.classList.remove("passcode-locked");
      return;
    }

    var gate = document.createElement("div");
    gate.className = "passcode-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "passcode-gate-title");

    gate.innerHTML =
      '<form class="passcode-card">' +
      '<p class="passcode-eyebrow">Private experiment</p>' +
      '<h1 id="passcode-gate-title">Renidy Funerals preview</h1>' +
      '<p class="passcode-copy">Enter the access code to view this landing page.</p>' +
      '<label for="passcode-input">Access code</label>' +
      '<input id="passcode-input" name="passcode" inputmode="numeric" autocomplete="one-time-code" />' +
      '<p class="passcode-error" aria-live="polite"></p>' +
      '<button type="submit">View page</button>' +
      '</form>';

    document.body.appendChild(gate);

    var form = gate.querySelector("form");
    var input = gate.querySelector("input");
    var error = gate.querySelector(".passcode-error");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (input.value.trim() === PASSCODE) {
        grantAccess(gate);
        return;
      }
      error.textContent = "That code does not match.";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      input.select();
    });

    window.setTimeout(function () {
      input.focus();
    }, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderGate);
  } else {
    renderGate();
  }
})();
