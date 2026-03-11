// Cache management utilities for performance optimization

export const CACHE_NAMES = {
  STATIC: 'static-v1',
  IMAGES: 'images-v1',
  API: 'api-v1',
  FONTS: 'fonts-v1'
} as const;

export const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
} as const;

// Assets to cache on install
export const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/placeholder.svg'
];

// Image extensions to cache
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico'];

// API endpoints to cache
export const CACHEABLE_API_ENDPOINTS = [
  '/api/services',
  '/api/calculators',
  '/api/compliance-calendar'
];

// Cache expiration times (in seconds)
export const CACHE_EXPIRATION = {
  STATIC: 60 * 60 * 24 * 30, // 30 days
  IMAGES: 60 * 60 * 24 * 7,  // 7 days
  API: 60 * 60,              // 1 hour
  FONTS: 60 * 60 * 24 * 365  // 1 year
};

// Check if request is cacheable
export function isCacheableRequest(request: Request): boolean {
  const url = new URL(request.url);
  
  // Don't cache non-GET requests
  if (request.method !== 'GET') return false;
  
  // Don't cache authenticated requests
  if (url.pathname.includes('/auth/') || url.pathname.includes('/admin/')) {
    return false;
  }
  
  // Don't cache requests with query parameters (except specific ones)
  if (url.search && !url.pathname.includes('/api/')) {
    return false;
  }
  
  return true;
}

// Get cache strategy for request
export function getCacheStrategy(request: Request): string {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Images - cache first
  if (IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // API calls - stale while revalidate
  if (pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Static assets - cache first
  if (STATIC_ASSETS.includes(pathname)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // Fonts - cache first
  if (pathname.includes('/fonts/') || pathname.endsWith('.woff2') || pathname.endsWith('.woff')) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // Default - network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Clean old caches
export async function cleanOldCaches(): Promise<void> {
  const cacheWhitelist = Object.values(CACHE_NAMES);
  const cacheNames = await caches.keys();
  
  await Promise.all(
    cacheNames.map(async (cacheName) => {
      if (!cacheWhitelist.includes(cacheName as any)) {
        console.log('Deleting old cache:', cacheName);
        await caches.delete(cacheName);
      }
    })
  );
}

// Cache with expiration
export async function cacheWithExpiration(
  cacheName: string,
  request: Request,
  response: Response,
  maxAge: number
): Promise<void> {
  const cache = await caches.open(cacheName);
  const clonedResponse = response.clone();
  
  // Add expiration header
  const headers = new Headers(clonedResponse.headers);
  headers.set('sw-cache-expires', new Date(Date.now() + maxAge * 1000).toISOString());
  
  const responseWithExpiration = new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers
  });
  
  await cache.put(request, responseWithExpiration);
}

// Check if cached response is expired
export function isCacheExpired(response: Response): boolean {
  const expires = response.headers.get('sw-cache-expires');
  if (!expires) return false;
  
  return new Date(expires) < new Date();
}

// Prefetch critical resources
export function prefetchCriticalResources(): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const criticalImages = [
        '/assets/images/hero-tax-filing.webp',
        '/assets/logos/myeca-logo.png'
      ];
      
      criticalImages.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'image';
        document.head.appendChild(link);
      });
    });
  }
}

// Browser cache control headers
export const CACHE_CONTROL_HEADERS = {
  STATIC: 'public, max-age=31536000, immutable',
  IMAGES: 'public, max-age=604800, stale-while-revalidate=86400',
  API: 'private, max-age=0, must-revalidate',
  FONTS: 'public, max-age=31536000, immutable'
};

// Storage quota management
export async function getStorageQuota(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;
    
    return { usage, quota, percentage };
  }
  
  return { usage: 0, quota: 0, percentage: 0 };
}

// Clear cache if storage is running low
export async function clearCacheIfNeeded(): Promise<void> {
  const { percentage } = await getStorageQuota();
  
  if (percentage > 80) {
    console.log('Storage quota above 80%, clearing old caches');
    
    // Clear image cache first (least critical)
    await caches.delete(CACHE_NAMES.IMAGES);
    
    if (percentage > 90) {
      // Clear API cache if still needed
      await caches.delete(CACHE_NAMES.API);
    }
  }
}