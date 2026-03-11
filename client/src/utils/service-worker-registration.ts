// Service Worker Registration with update handling

export async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            showUpdateNotification();
          }
        });
      });

      // Handle controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

function showUpdateNotification(): void {
  // You can implement a toast notification here
  const shouldUpdate = confirm('A new version of MyeCA.in is available. Update now?');
  
  if (shouldUpdate) {
    // Skip waiting and reload
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Unregister service worker (useful for development)
export async function unregisterServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
}

// Check if service worker is supported and active
export function isServiceWorkerActive(): boolean {
  return 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
}

// Send message to service worker
export function sendMessageToServiceWorker(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('No active service worker'));
      return;
    }

    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
}

// Prefetch resources using service worker
export async function prefetchResources(urls: string[]): Promise<void> {
  if (!isServiceWorkerActive()) return;

  try {
    await sendMessageToServiceWorker({
      type: 'PREFETCH_RESOURCES',
      urls
    });
  } catch (error) {
    console.error('Failed to prefetch resources:', error);
  }
}

// Clear service worker caches
export async function clearServiceWorkerCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('All caches cleared');
  }
}

// Get cache storage info
export async function getCacheStorageInfo(): Promise<{
  caches: Array<{ name: string; size: number }>;
  totalSize: number;
}> {
  if (!('caches' in window)) {
    return { caches: [], totalSize: 0 };
  }

  const cacheNames = await caches.keys();
  const cacheInfo = [];
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    let cacheSize = 0;
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response && response.body) {
        const blob = await response.blob();
        cacheSize += blob.size;
      }
    }
    
    cacheInfo.push({ name: cacheName, size: cacheSize });
    totalSize += cacheSize;
  }

  return { caches: cacheInfo, totalSize };
}