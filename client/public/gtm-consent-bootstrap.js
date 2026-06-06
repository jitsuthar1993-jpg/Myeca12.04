(function (window, document, scriptTag, dataLayerName) {
  var bootstrapScript = document.currentScript;
  var tagManagerId = bootstrapScript && bootstrapScript.getAttribute("data-gtm-id");
  if (!/^GTM-[A-Z0-9]+$/i.test(tagManagerId || "")) return;

  window[dataLayerName] = window[dataLayerName] || [];
  window.gtag = window.gtag || function gtag() {
    window[dataLayerName].push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
  window.gtag("set", "ads_data_redaction", true);

  window[dataLayerName].push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  var firstScript = document.getElementsByTagName(scriptTag)[0];
  var tagManagerScript = document.createElement(scriptTag);
  var dataLayerParam = dataLayerName !== "dataLayer" ? "&l=" + dataLayerName : "";
  tagManagerScript.async = true;
  tagManagerScript.src = "https://www.googletagmanager.com/gtm.js?id=" + tagManagerId + dataLayerParam;
  firstScript.parentNode.insertBefore(tagManagerScript, firstScript);
})(window, document, "script", "dataLayer");
