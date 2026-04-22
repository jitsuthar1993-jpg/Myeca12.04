import React from "react";
import { useParams, Link } from "wouter";
import { m } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  CheckCircle, 
  Shield, 
  Clock, 
  Phone, 
  ArrowRight,
  TrendingUp,
  Award,
  Users
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cityData: Record<string, { name: string; landmark: string; population: string }> = {
  bangalore: { name: "Bangalore", landmark: "Koramangala & HSR Layout", population: "Startup Hub of India" },
  mumbai: { name: "Mumbai", landmark: "BKC & Nariman Point", population: "Financial Capital" },
  delhi: { name: "Delhi", landmark: "Connaught Place & Nehru Place", population: "National Capital Region" },
  hyderabad: { name: "Hyderabad", landmark: "HITEC City & Gachibowli", population: "Cyberabad Tech Hub" },
  chennai: { name: "Chennai", landmark: "T. Nagar & OMR", population: "Automobile & SaaS Hub" }
};

const serviceData: Record<string, { title: string; desc: string; icon: any }> = {
  "company-registration": { 
    title: "Company Registration", 
    desc: "Fast-track Private Limited & LLP incorporation with local CA expertise.",
    icon: Building2 
  },
  "gst-registration": { 
    title: "GST Registration", 
    desc: "Obtain your GSTIN with zero hassles and expert filing support.",
    icon: TrendingUp 
  }
};

export default function CityLandingPage() {
  const params = useParams<{ service: string; city: string }>();
  const cityKey = params.city?.toLowerCase() || "";
  const serviceKey = params.service?.toLowerCase() || "";
  
  const city = cityData[cityKey];
  const service = serviceData[serviceKey];

  if (!city || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service or City not found</h1>
          <Link href="/services"><Button>Back to Services</Button></Link>
        </div>
      </div>
    );
  }

  const pageTitle = `${service.title} in ${city.name} | Expert CA Services ${city.name}`;
  const pageDesc = `Get professional ${service.title} in ${city.name}. Expert CA assistance for ${city.landmark} businesses. Local expertise, fast processing, and 100% compliance guaranteed.`;

  return (
    <div className="min-h-screen bg-white">
      <MetaSEO
        title={pageTitle}
        description={pageDesc}
        keywords={[
          `${service.title} in ${city.name}`,
          `CA in ${city.name}`,
          `business registration ${city.name}`,
          `company incorporation ${city.name}`,
          `top ca firms in ${city.name}`
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service.title, url: `/services/${serviceKey}` },
          { name: city.name, url: `/services/${serviceKey}/${cityKey}` }
        ]}
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-500/30"
            >
              <MapPin className="w-4 h-4" />
              Serving {city.name}: {city.population}
            </m.div>
            
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
              Expert <span className="text-blue-400">{service.title}</span> 
              <br />Services in <span className="underline decoration-blue-500 underline-offset-8">{city.name}</span>
            </h1>
            
            <p className="text-xl text-blue-100/80 mb-10 leading-relaxed max-w-2xl">
              Launch your venture with confidence. Our {city.name}-based CAs provide 
              end-to-end support for businesses in {city.landmark} and across the NCR.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 rounded-xl text-lg font-bold shadow-xl shadow-blue-500/20">
                Talk to a {city.name} CA
                <Phone className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 h-14 rounded-xl text-lg font-bold">
                View Local Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Local Advantage Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">
                Why Choose MyeCA for {service.title} in {city.name}?
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Navigating the local regulatory landscape in {city.name} requires more than just paperwork. 
                Our team understands the specific requirements of the {city.name} ROC and local municipal bodies.
              </p>
              
              <div className="space-y-4">
                {[
                  `Local Office visits available in ${city.landmark}`,
                  "Deep understanding of state-specific stamp duty",
                  "Fast-track processing with local authorities",
                  "Trusted by 500+ businesses in the region"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-8">
                  <div className="text-4xl font-black text-blue-600 mb-2">99%</div>
                  <div className="text-sm font-bold text-slate-600">Approval Rate in {city.name}</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-100">
                <CardContent className="pt-8">
                  <div className="text-4xl font-black text-purple-600 mb-2">24h</div>
                  <div className="text-sm font-bold text-slate-600">Local Expert Callback</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="pt-8">
                  <div className="text-4xl font-black text-orange-600 mb-2">500+</div>
                  <div className="text-sm font-bold text-slate-600">Local Clients Served</div>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="pt-8">
                  <div className="text-4xl font-black text-emerald-600 mb-2">0</div>
                  <div className="text-sm font-bold text-slate-600">Hidden Local Charges</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhood Support */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Serving All Major Neighborhoods in {city.name}
            </h2>
            <p className="text-lg text-slate-600 italic">
              "CA-reviewed compliance services for businesses across {city.name}."
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {["Business Hubs", "IT Parks", "Industrial Zones", "Retail Districts", "Startup Clusters"].map((area) => (
              <div key={area} className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow">
                <div className="font-bold text-slate-900 mb-1">{area}</div>
                <div className="text-xs text-blue-500 font-bold uppercase tracking-widest">Available</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Card className="bg-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <CardContent className="p-12 text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                Ready to Start your Business in {city.name}?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join the league of successful {city.name} entrepreneurs. Get your {service.title} 
                started by a licensed CA today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-black h-14 px-10 rounded-xl transition-all hover:scale-105">
                  Book Free Consultation
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-black h-14 px-10 rounded-xl">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
