// Service Worker Registration Utility

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export async function registerServiceWorker(config?: ServiceWorkerConfig) {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return;
  }

  // Only register in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !import.meta.env.VITE_ENABLE_SW) {
    console.log('[SW] Skipping registration in development');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Registration successful:', registration.scope);

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
          showUpdateNotification();
        }
      });
    });

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

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update().catch(console.error);
    }, 60 * 60 * 1000);

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
  }
}

// Show notification when update is available
function showUpdateNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      padding: 16px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideUp 0.3s ease;
    ">
      <div style="
        width: 40px;
        height: 40px;
        background: #dbeafe;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      ">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2563eb">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div style="flex: 1;">
        <p style="font-weight: 600; color: #1f2937; margin: 0 0 4px;">Update Available</p>
        <p style="font-size: var(--text-sm); color: #6b7280; margin: 0;">A new version is ready. Refresh to update.</p>
      </div>
      <button onclick="window.location.reload()" style="
        background: #2563eb;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
      ">Refresh</button>
      <button onclick="if(this.parentElement && this.parentElement.parentElement) this.parentElement.parentElement.remove()" style="
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #9ca3af;
      ">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(notification);
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
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
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
  return 'BeforeInstallPromptEvent' in window || 
         (navigator as any).standalone === false;
}

// PWA Install prompt handler
let deferredInstallPrompt: any = null;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
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

  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  
  console.log('[PWA] Install prompt outcome:', outcome);
  deferredInstallPrompt = null;
  
  return outcome === 'accepted';
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

