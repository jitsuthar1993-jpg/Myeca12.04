(function () {
  var CHUNK_RECOVERY_KEY = "myeca:bootstrap-chunk-recovery";

  function isRecoverableChunkError(value) {
    return /ChunkLoadError|Loading chunk \d+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Failed to load module script|MIME type.*text\/html/i.test(String(value || ""));
  }

  function recoverFromStaleChunk(value) {
    if (!isRecoverableChunkError(value)) return false;

    try {
      if (sessionStorage.getItem(CHUNK_RECOVERY_KEY)) return false;
      sessionStorage.setItem(CHUNK_RECOVERY_KEY, String(Date.now()));
    } catch (_) {
      return false;
    }

    var cleanup = Promise.resolve();
    if ("caches" in window) {
      cleanup = cleanup.then(function () {
        return caches.keys().then(function (names) {
          return Promise.all(names.map(function (name) { return caches.delete(name); }));
        });
      });
    }

    if ("serviceWorker" in navigator) {
      cleanup = cleanup.then(function () {
        return navigator.serviceWorker.getRegistrations().then(function (registrations) {
          return Promise.all(registrations.map(function (registration) { return registration.unregister(); }));
        });
      });
    }

    cleanup.catch(function () {}).then(function () { location.reload(); });
    return true;
  }

  window.onerror = function (msg, url, line) {
    if (recoverFromStaleChunk(msg)) return true;

    var root = document.getElementById("root");
    if (!root) return false;

    var panel = document.createElement("div");
    panel.style.cssText = "padding:20px;background:#fee;border:2px solid red;margin:20px;border-radius:8px;";

    var title = document.createElement("h2");
    title.style.color = "red";
    title.textContent = "JavaScript Error";

    var message = document.createElement("p");
    var strong = document.createElement("strong");
    strong.textContent = String(msg || "Unexpected error");
    message.appendChild(strong);

    var locationLine = document.createElement("p");
    locationLine.style.color = "#666";
    locationLine.textContent = "At: " + String(url || "") + ":" + String(line || "");

    var actions = document.createElement("p");
    actions.style.marginTop = "15px";

    var reload = document.createElement("button");
    reload.id = "js-error-reload";
    reload.type = "button";
    reload.style.cssText = "padding:10px 20px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;";
    reload.textContent = "Reload Page";
    reload.addEventListener("click", function () { location.reload(); });
    actions.appendChild(reload);

    panel.appendChild(title);
    panel.appendChild(message);
    panel.appendChild(locationLine);
    panel.appendChild(actions);
    root.replaceChildren(panel);

    return false;
  };

  window.addEventListener("unhandledrejection", function (event) {
    recoverFromStaleChunk(event.reason && (event.reason.message || event.reason));
  });
})();
