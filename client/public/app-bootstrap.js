(function () {
  var fontLink = document.getElementById("app-font-css");
  if (fontLink) {
    window.setTimeout(function () {
      fontLink.media = "all";
    }, 0);
  }

  window.onerror = function (msg, url, line) {
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
})();
