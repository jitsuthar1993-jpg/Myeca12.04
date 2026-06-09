// Service Worker Registration Utility
import { recordReloadAttempt } from "@/utils/reload-diagnostics";

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

interface ServiceWorkerRuntimeOptions {
  now?: () => number;
  pathname?: string;
  reloadPage?: () => void;
  storage?: Storage | null;
}

type BeforeInstallPromptOutcome = 'accepted' | 'dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: BeforeInstallPromptOutcome;
    platform: string;
  }>;
}

let isReloadingForServiceWorkerUpdate = false;
let shouldReloadForServiceWorkerUpdate = false;
let updateNotificationTimer: number | undefined;

const UPDATE_NOTIFICATION_DELAY_MS = 5_000;
const UPDATE_NOTIFICATION_CONVERSION_PATHS = ["/", "/pricing", "/which-itr-form-to-file", "/itr/form-selector"];
const SW_DEV_UNREGISTERED_KEY = "sw_dev_unregistered";

function getRuntimeStorage(options?: ServiceWorkerRuntimeOptions) {
  return options?.storage ?? (typeof window === "undefined" ? null : window.sessionStorage);
}

function readStorageFlag(storage: Storage | null, key: string) {
  try {
    return storage?.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageFlag(storage: Storage | null, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Best-effort guard; a storage failure should not block SW cleanup.
  }
}

function isConversionPath(path: string) {
  const normalized = (path.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/";
  return UPDATE_NOTIFICATION_CONVERSION_PATHS.some((prefix) => {
    if (prefix === "/") return normalized === "/";
    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  });
}

function applyWaitingServiceWorkerUpdate(registration?: ServiceWorkerRegistration) {
  const waitingWorker = registration?.waiting;

  if (!waitingWorker) {
    window.location.reload();
    return;
  }

  shouldReloadForServiceWorkerUpdate = true;
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });

  window.setTimeout(() => {
    if (!isReloadingForServiceWorkerUpdate) {
      window.location.reload();
    }
  }, 3000);
}

export async function registerServiceWorker(config?: ServiceWorkerConfig, options: ServiceWorkerRuntimeOptions = {}) {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return;
  }

  // Register in production or if explicitly enabled (enabled for speed testing)
  if (process.env.NODE_ENV !== 'production' && !import.meta.env.VITE_ENABLE_SW) {
    console.log('[SW] Skipping registration in development (auto-unregistering)');
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      const hadAny = regs.length > 0;
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
      const storage = getRuntimeStorage(options);

      // If an old SW was controlling the page, force a one-time reload to detach it.
      if (hadAny && navigator.serviceWorker.controller && !readStorageFlag(storage, SW_DEV_UNREGISTERED_KEY)) {
        const now = options.now?.() ?? Date.now();
        const path = (options.pathname ?? window.location.pathname) || "/";
        writeStorageFlag(storage, SW_DEV_UNREGISTERED_KEY, '1');
        recordReloadAttempt("service_worker_dev_unregistered", {
          path,
          now,
          storage,
        });
        (options.reloadPage ?? (() => window.location.reload()))();
        return;
      }
    } catch (e) {
      console.warn('[SW] Dev unregister failed:', e);
    }
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[SW] Registration successful:', registration.scope);

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!shouldReloadForServiceWorkerUpdate || isReloadingForServiceWorkerUpdate) return;
      isReloadingForServiceWorkerUpdate = true;
      window.location.reload();
    });

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available
          console.log('[SW] New content available');
          config?.onUpdate?.(registration);
          
          // Show update notification
          showUpdateNotification(registration);
        }
      });
    });

    if (registration.waiting && navigator.serviceWorker.controller) {
      config?.onUpdate?.(registration);
      showUpdateNotification(registration);
    }

    // Handle successful registration
    if (registration.active) {
      config?.onSuccess?.(registration);
    }

    // Handle offline/online events
    window.addEventListener('offline', () => {
      console.log('[SW] App is offline');
      config?.onOffline?.();
    });

    window.addEventListener('online', () => {
      console.log('[SW] App is online');
      config?.onOnline?.();
    });

    // Check for updates every 24 hours (avoid unnecessary network traffic)
    setInterval(() => {
      registration.update().catch(() => {});
    }, 24 * 60 * 60 * 1000);

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
  }
}

// Show notification when update is available
function showUpdateNotification(registration?: ServiceWorkerRegistration) {
  const pathAtRequest = window.location.pathname;
  if (isConversionPath(pathAtRequest)) {
    window.clearTimeout(updateNotificationTimer);
    updateNotificationTimer = window.setTimeout(() => {
      if (isConversionPath(window.location.pathname)) {
        renderUpdateNotification(registration, true);
      }
    }, UPDATE_NOTIFICATION_DELAY_MS);
    return;
  }

  renderUpdateNotification(registration, false);
}

function renderUpdateNotification(registration?: ServiceWorkerRegistration, conversionPlacement = false) {
  document.getElementById('sw-update-notification')?.remove();

  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  Object.assign(notification.style, {
    position: 'fixed',
    ...(conversionPlacement
      ? { top: '88px', right: '16px', left: '16px' }
      : { bottom: '20px', left: '20px', right: '20px' }),
    maxWidth: '400px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    padding: '16px',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transform: 'translateY(0)',
  });

  const icon = document.createElement('div');
  Object.assign(icon.style, {
    width: '40px',
    height: '40px',
    background: '#dbeafe',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
  });
  icon.appendChild(createSvgIcon('M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'));

  const text = document.createElement('div');
  text.style.flex = '1';

  const title = document.createElement('p');
  Object.assign(title.style, {
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px',
  });
  title.textContent = 'Update Available';

  const body = document.createElement('p');
  Object.assign(body.style, {
    fontSize: 'var(--text-sm)',
    color: '#6b7280',
    margin: '0',
  });
  body.textContent = 'A new version is ready. Refresh to update.';
  text.append(title, body);

  const refresh = document.createElement('button');
  refresh.id = 'sw-update-refresh';
  refresh.type = 'button';
  Object.assign(refresh.style, {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
  });
  refresh.textContent = 'Refresh';
  refresh.addEventListener('click', () => applyWaitingServiceWorkerUpdate(registration));

  const dismiss = document.createElement('button');
  dismiss.id = 'sw-update-dismiss';
  dismiss.type = 'button';
  dismiss.setAttribute('aria-label', 'Dismiss update notification');
  Object.assign(dismiss.style, {
    background: 'transparent',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: '#9ca3af',
    lineHeight: '0',
  });
  dismiss.appendChild(createSvgIcon('M6 18L18 6M6 6l12 12', 'currentColor'));
  dismiss.addEventListener('click', () => notification.remove());

  notification.append(icon, text, refresh, dismiss);
  
  document.body.appendChild(notification);
}

function createSvgIcon(pathData: string, stroke = '#2563eb'): SVGSVGElement {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke', stroke);
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', pathData);
  svg.appendChild(path);
  return svg;
}

// Unregister service worker
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('[SW] Unregistered successfully');
    }
  } catch (error) {
    console.error('[SW] Unregistration failed:', error);
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('[SW] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Subscribe to push notifications
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
    });

    console.log('[SW] Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('[SW] Push subscription failed:', error);
    return null;
  }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if app can be installed (PWA)
export function canInstallPWA(): boolean {
  return Boolean(deferredInstallPrompt) ||
         ((navigator as any).standalone === false && !isStandalone());
}

// PWA Install prompt handler
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let installPromptListenersReady = false;

export function hasDeferredInstallPrompt(): boolean {
  return Boolean(deferredInstallPrompt);
}

export function setupInstallPrompt() {
  if (installPromptListenersReady) return;
  installPromptListenersReady = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    const e = event as BeforeInstallPromptEvent;
    e.preventDefault();
    deferredInstallPrompt = e;
    
    // Show custom install button
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'block';
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwainstallready'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    deferredInstallPrompt = null;
    
    // Hide install button
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'none';
    }
    
    // Track installation
    window.dispatchEvent(new CustomEvent('pwainstalled'));
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) {
    console.log('[PWA] No install prompt available');
    return false;
  }

  const promptEvent = deferredInstallPrompt;
  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;
  
  console.log('[PWA] Install prompt outcome:', outcome);
  deferredInstallPrompt = null;
  
  return outcome === 'accepted';
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}
