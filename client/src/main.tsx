import { createRoot } from "react-dom/client";
import App from "./App";
import "./utils/safe-dom";
import "./index.css";

// PWA Service Worker registration - disabled temporarily for debugging
// import { registerServiceWorker, setupInstallPrompt } from "./utils/registerSW";
// registerServiceWorker();
// setupInstallPrompt();

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }
  
  createRoot(root).render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Failed to render app:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; background: white;">
      <h1 style="color: red;">App Loading Error</h1>
      <p>Error: ${error}</p>
    </div>
  `;
}
