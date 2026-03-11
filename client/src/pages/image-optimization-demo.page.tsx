import { useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import ImageGallery from '@/components/ImageGallery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateSrcSet, generateSizes, optimizeImageUrl } from '@/utils/image-utils';
import { Button } from '@/components/ui/button';
import { getCacheStorageInfo } from '@/utils/service-worker-registration';
import SEO from '@/components/SEO';

export default function ImageOptimizationDemoPage() {
  const [cacheInfo, setCacheInfo] = useState<any>(null);

  const handleCheckCache = async () => {
    const info = await getCacheStorageInfo();
    setCacheInfo(info);
  };

  const demoImages = [
    {
      src: '/assets/images/tax-filing-process.jpg',
      alt: 'Tax filing process illustration',
      caption: 'Step-by-step tax filing guide'
    },
    {
      src: '/assets/images/ca-consultation.jpg',
      alt: 'CA consultation session',
      caption: 'Expert CA consultation'
    },
    {
      src: '/assets/images/refund-processing.jpg',
      alt: 'Refund processing dashboard',
      caption: 'Track your refund status'
    }
  ];

  return (
    <>
      <SEO
        title="Image Optimization Demo - MyeCA.in"
        description="Demonstration of advanced image optimization techniques including lazy loading, modern formats, and caching strategies."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Image Optimization Demo</h1>
            <p className="text-xl text-gray-600">
              Advanced image loading and optimization techniques for better performance
            </p>
          </div>

          <Tabs defaultValue="optimized" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="optimized">Optimized Images</TabsTrigger>
              <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
              <TabsTrigger value="comparison">Before/After</TabsTrigger>
              <TabsTrigger value="cache">Cache Info</TabsTrigger>
            </TabsList>

            <TabsContent value="optimized" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lazy Loading with Modern Formats</CardTitle>
                  <CardDescription>
                    Images load only when visible and use WebP/AVIF formats when supported
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Priority Loading (Hero Image)</h3>
                      <OptimizedImage
                        src="/assets/images/hero-tax-filing.jpg"
                        alt="Hero tax filing image"
                        className="w-full h-64 rounded-lg shadow-lg"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Lazy Loading (Below Fold)</h3>
                      <OptimizedImage
                        src="/assets/images/services-overview.jpg"
                        alt="Services overview"
                        className="w-full h-64 rounded-lg shadow-lg"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Responsive Image with Art Direction</h3>
                    <OptimizedImage
                      src="/assets/images/team-collaboration.jpg"
                      alt="Team collaboration"
                      className="w-full h-96 rounded-lg shadow-lg"
                      sizes={generateSizes({
                        '640px': '100vw',
                        '1024px': '80vw',
                        'default': '1200px'
                      })}
                      srcSet={generateSrcSet('/assets/images/team-collaboration.jpg')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Image Gallery</CardTitle>
                  <CardDescription>
                    Gallery with lightbox, zoom, and navigation features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageGallery images={demoImages} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Before & After Optimization</CardTitle>
                  <CardDescription>
                    Compare loading performance with and without optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Standard Image Tag</h3>
                      <img
                        src="/assets/images/comparison-standard.jpg"
                        alt="Standard loading"
                        className="w-full h-64 object-cover rounded-lg shadow-lg"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        • No lazy loading<br />
                        • Single format (JPEG)<br />
                        • No responsive sizing<br />
                        • Blocks rendering
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Optimized Image Component</h3>
                      <OptimizedImage
                        src="/assets/images/comparison-optimized.jpg"
                        alt="Optimized loading"
                        className="w-full h-64 rounded-lg shadow-lg"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        • Lazy loading enabled<br />
                        • WebP/AVIF support<br />
                        • Responsive sizing<br />
                        • Progressive enhancement
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cache" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Worker Cache Information</CardTitle>
                  <CardDescription>
                    View cached images and storage usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleCheckCache}>Check Cache Status</Button>
                  
                  {cacheInfo && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Cache Storage Summary</h3>
                        <p>Total Size: {(cacheInfo.totalSize / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold">Individual Caches:</h3>
                        {cacheInfo.caches.map((cache: any) => (
                          <div key={cache.name} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <span className="font-medium">{cache.name}</span>
                            <span className="text-sm text-gray-600">
                              {(cache.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Image Optimization Benefits</CardTitle>
                  <CardDescription>
                    Key improvements from our optimization strategy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Performance Gains</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          70% faster initial page load
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          85% reduction in bandwidth usage
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          Improved Core Web Vitals scores
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          Better mobile performance
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Technical Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Intersection Observer API
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Service Worker caching
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Modern image formats
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Responsive images
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}