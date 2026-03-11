import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/performance/LazyImage';
import { LazySection } from '@/components/performance/LazySection';
import { OptimizedInput } from '@/components/performance/OptimizedInput';
import SEO from '@/components/SEO';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';

export default function PerformanceDemoPage() {
  const [swStatus, setSwStatus] = useState<'checking' | 'active' | 'not-supported' | 'error'>('checking');
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  }>({});

  useEffect(() => {
    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.active) {
          setSwStatus('active');
          // Check cache size
          if ('caches' in window) {
            caches.keys().then(names => {
              setCacheSize(names.length);
            });
          }
        } else {
          setSwStatus('error');
        }
      });
    } else {
      setSwStatus('not-supported');
    }

    // Get performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setPerformanceMetrics(prev => ({ ...prev, fcp: Math.round(entry.startTime) }));
        }
        if (entry.entryType === 'largest-contentful-paint') {
          setPerformanceMetrics(prev => ({ ...prev, lcp: Math.round(entry.startTime) }));
        }
        if (entry.entryType === 'layout-shift') {
          const layoutShiftEntry = entry as any;
          setPerformanceMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (layoutShiftEntry.value || 0) }));
        }
        if (entry.entryType === 'first-input') {
          const firstInputEntry = entry as any;
          setPerformanceMetrics(prev => ({ 
            ...prev, 
            fid: Math.round((firstInputEntry.processingStart || entry.startTime) - entry.startTime) 
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });

    // Get TTFB
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setPerformanceMetrics(prev => ({ ...prev, ttfb: Math.round(navigation.responseStart - navigation.requestStart) }));
    }

    return () => observer.disconnect();
  }, []);

  const clearCache = async () => {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
      setCacheSize(0);
      window.location.reload();
    }
  };

  return (
    <>
      <SEO 
        title="Performance Demo - MyeCA.in"
        description="Explore the performance optimizations implemented on MyeCA.in"
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Performance Optimization Demo</h1>
            <p className="text-xl text-gray-600">Explore the performance improvements we've implemented</p>
          </div>

          {/* Service Worker Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Service Worker Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {swStatus === 'active' ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-green-700 font-medium">Service Worker Active</span>
                      <Badge variant="secondary">Caching Enabled</Badge>
                      <Badge variant="outline">{cacheSize} Caches Active</Badge>
                    </>
                  ) : swStatus === 'checking' ? (
                    <>
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="text-blue-700">Checking...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-500" />
                      <span className="text-red-700">Service Worker Not Active</span>
                    </>
                  )}
                </div>
                {swStatus === 'active' && (
                  <Button onClick={clearCache} variant="outline" size="sm">
                    Clear Cache
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { name: 'FCP', value: performanceMetrics.fcp, unit: 'ms', good: 1800, poor: 3000 },
                  { name: 'LCP', value: performanceMetrics.lcp, unit: 'ms', good: 2500, poor: 4000 },
                  { name: 'FID', value: performanceMetrics.fid, unit: 'ms', good: 100, poor: 300 },
                  { name: 'CLS', value: performanceMetrics.cls, unit: '', good: 0.1, poor: 0.25 },
                  { name: 'TTFB', value: performanceMetrics.ttfb, unit: 'ms', good: 800, poor: 1800 },
                ].map((metric) => (
                  <div key={metric.name} className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700">{metric.name}</h3>
                    <p className={`text-2xl font-bold ${
                      metric.value !== undefined 
                        ? metric.value <= metric.good 
                          ? 'text-green-600' 
                          : metric.value <= metric.poor 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        : 'text-gray-400'
                    }`}>
                      {metric.value !== undefined ? `${metric.value}${metric.unit}` : '-'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lazy Loading Demo */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Lazy Loading Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Scroll down to see lazy-loaded sections appear</p>
              
              <LazySection threshold={0.5} rootMargin="50px">
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">This section loads when visible</h3>
                  <p className="text-gray-600">The LazySection component defers rendering until the section enters the viewport.</p>
                </div>
              </LazySection>
            </CardContent>
          </Card>

          {/* Optimized Image Demo */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Optimized Image Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  '/assets/logos/Tata_Consultancy_Services_old_logo.svg',
                  '/assets/logos/Wipro_Primary_Logo_Color_RGB.svg',
                  '/assets/logos/ITC_Limited_Logo.svg',
                  '/assets/logos/airtel.svg'
                ].map((src, index) => (
                  <div key={index} className="space-y-2">
                    <LazyImage
                      src={src}
                      alt={`Demo image ${index + 1}`}
                      className="w-full h-32 object-contain bg-gray-100 rounded"
                      fallback="/placeholder.svg"
                    />
                    <p className="text-sm text-gray-600 text-center">Lazy loaded image</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimized Input Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Debounced Input Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">The OptimizedInput component debounces input to reduce re-renders</p>
              <OptimizedInput
                placeholder="Type here - changes are debounced by 300ms"
                debounceDelay={300}
                onDebouncedChange={(value) => console.log('Debounced value:', value)}
              />
              <p className="text-sm text-gray-500">Check the console to see debounced values</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}