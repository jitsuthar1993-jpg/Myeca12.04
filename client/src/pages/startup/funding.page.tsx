import { motion } from "framer-motion";
import { 
  ArrowRight, 
  IndianRupee, 
  Globe, 
  Building2, 
  Users, 
  TrendingUp,
  FileText,
  CheckCircle,
  ExternalLink,
  Clock,
  Award,
  Target,
  Briefcase,
  Rocket
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import SEO from "@/components/SEO";

const FundingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("government");

  const governmentSchemes = [
    {
      name: "Startup India Seed Fund Scheme (SISFS)",
      amount: "Up to \u20B970 Lakhs",
      description: "Comprehensive early-stage support for proof of concept, prototype development, and market entry",
      highlights: [
        "\u20B920 lakhs grant for concept validation",
        "\u20B950 lakhs debt/convertible debentures for scaling",
        "\u20B9916.91 crore approved across 217 incubators",
        "No collateral or personal guarantee required"
      ],
      eligibility: [
        "DPIIT-recognized startups ≤2 years old",
        "Technology-based products/services",
        "Scalable business model with market fit",
        "51% Indian shareholding"
      ],
      link: "https://seedfund.startupindia.gov.in",
      color: "blue"
    },
    {
      name: "Credit Guarantee Scheme for Startups (CGSS)",
      amount: "Up to \u20B920 Crores",
      description: "Collateral-free loans with government backing for growth-stage startups",
      highlights: [
        "85% guarantee for loans up to \u20B910 crore",
        "75% guarantee for loans above \u20B910 crore",
        "No collateral required",
        "2% annual guarantee fee only"
      ],
      eligibility: [
        "DPIIT-recognized startups",
        "Any stage of business",
        "Apply through 25+ member banks/NBFCs"
      ],
      link: "https://www.startupindia.gov.in/credit-guarantee-scheme-for-startups.html",
      color: "green"
    },
    {
      name: "Fund of Funds for Startups (FFS)",
      amount: "\u20B910,000 Crore Corpus",
      description: "Indirect funding through SEBI-registered Alternative Investment Funds (AIFs)",
      highlights: [
        "Government invests in AIFs",
        "AIFs then fund startups",
        "Focus on equity funding",
        "Supports entire startup lifecycle"
      ],
      eligibility: [
        "Must approach participating AIFs",
        "Cannot apply directly",
        "All stages of startups eligible"
      ],
      link: "https://www.startupindia.gov.in",
      color: "purple"
    },
    {
      name: "SAMRIDH Scheme (MeitY)",
      amount: "\u20B940 Lakhs",
      description: "Support for product-based startups with proven concept",
      highlights: [
        "Acceleration through approved accelerators",
        "Focus on deep tech and innovation",
        "Mentorship and market access",
        "Product development support"
      ],
      eligibility: [
        "Product-based startups",
        "Established proof of concept",
        "Technology focus preferred"
      ],
      link: "https://msh.meity.gov.in",
      color: "orange"
    },
    {
      name: "Karnataka ELEVATE",
      amount: "Up to \u20B950 Lakhs",
      description: "Grant support for Karnataka-based startups",
      highlights: [
        "Direct grant funding",
        "Special tracks for SC/ST/OBC entrepreneurs",
        "Sector-agnostic support",
        "Mentorship included"
      ],
      eligibility: [
        "Karnataka-registered startups",
        "Less than 10 years old",
        "Revenue < \u20B9100 crore"
      ],
      link: "https://www.elevate.kar.nic.in",
      color: "red"
    },
    {
      name: "Biotechnology Ignition Grant (BIG)",
      amount: "Up to \u20B950 Lakhs",
      description: "Early-stage funding for biotech startups",
      highlights: [
        "Grant funding for proof of concept",
        "18-month support period",
        "Technical mentorship",
        "Lab access support"
      ],
      eligibility: [
        "Biotech/life sciences focus",
        "Early-stage startups",
        "Indian citizens only"
      ],
      link: "https://birac.nic.in",
      color: "teal"
    }
  ];

  const internationalPrograms = [
    {
      name: "Google for Startups Accelerator",
      type: "Accelerator",
      duration: "3 months",
      description: "Equity-free accelerator for AI-first tech startups",
      benefits: [
        "Google Cloud credits & TPU access",
        "Dedicated mentoring from Google teams",
        "Access to Google's expert network",
        "Product credits and new tools"
      ],
      focus: "AI-first technology, Climate tech",
      stage: "Seed to Series A",
      link: "https://startup.google.com/programs/accelerator/",
      icon: <Globe className="w-6 h-6" />
    },
    {
      name: "Google.org Generative AI Accelerator",
      type: "Grant + Accelerator",
      duration: "6 months",
      description: "Social impact startups using Generative AI",
      benefits: [
        "$30M funding pool",
        "Equity-free support",
        "Technical mentorship",
        "Google resources access"
      ],
      focus: "Social impact + Gen AI",
      stage: "All stages",
      link: "https://impactchallenge.withgoogle.com/genaiaccelerator",
      icon: <Award className="w-6 h-6" />
    },
    {
      name: "Gates Foundation Accelerator",
      type: "Grant Funding",
      duration: "Varies",
      description: "Global health and development technology",
      benefits: [
        "Significant grant funding",
        "Global network access",
        "Technical expertise",
        "Market access support"
      ],
      focus: "Health, Development, Equity",
      stage: "Primarily through partners",
      link: "https://www.gatesfoundation.org/about/how-we-work/grant-opportunities",
      icon: <Target className="w-6 h-6" />
    },
    {
      name: "Y Combinator",
      type: "Accelerator + Investment",
      duration: "3 months",
      description: "World's most prestigious startup accelerator",
      benefits: [
        "$500,000 investment",
        "Intensive mentorship",
        "Demo Day access",
        "YC alumni network"
      ],
      focus: "All sectors",
      stage: "Early stage",
      link: "https://www.ycombinator.com",
      icon: <Rocket className="w-6 h-6" />
    }
  ];

  const vcFirms = [
    {
      name: "Peak XV Partners",
      formerly: "Sequoia Capital India",
      focus: "Consumer, SaaS, Fintech, Healthcare",
      stage: "Seed to Growth",
      portfolio: "Zomato, BYJU'S, Unacademy, CarDekho",
      aum: "Leading position in India",
      website: "https://www.peakxv.com",
      logo: "🏔️"
    },
    {
      name: "Accel India",
      formerly: "Accel Partners",
      focus: "Consumer, SaaS, Fintech, B2B",
      stage: "Seed to Series B",
      portfolio: "Flipkart, Swiggy, Freshworks, Myntra",
      aum: "$550M (Fund VI)",
      website: "https://www.accel.com",
      logo: "🚀"
    },
    {
      name: "Tiger Global",
      formerly: "-",
      focus: "Internet, Software, Consumer",
      stage: "Growth Stage",
      portfolio: "Meesho, Infra.Market, Captain Fresh",
      aum: "$2.2B latest fund",
      website: "https://www.tigerglobal.com",
      logo: "🐅"
    },
    {
      name: "Blume Ventures",
      formerly: "-",
      focus: "Deep tech, Consumer, B2B",
      stage: "Seed & Pre-Series A",
      portfolio: "GreyOrange, Unacademy, Purplle",
      aum: "$102M (Fund III)",
      website: "https://blume.vc",
      logo: "🌸"
    },
    {
      name: "Matrix Partners India",
      formerly: "-",
      focus: "Consumer Internet, SaaS, Fintech",
      stage: "Seed to Series B",
      portfolio: "Ola, Practo, Razorpay",
      aum: "60+ investments",
      website: "https://www.matrixpartners.in",
      logo: "🔷"
    },
    {
      name: "Nexus Venture Partners",
      formerly: "-",
      focus: "Product-first companies",
      stage: "Seed to Series A",
      portfolio: "Delhivery, Postman, Druva",
      aum: "$2.6B under management",
      website: "https://nexusvp.com",
      logo: "🔗"
    }
  ];

  const angelInvestors = [
    {
      name: "Ratan Tata",
      background: "Chairman Emeritus, Tata Sons",
      investments: "Ola, Paytm, Snapdeal, Urban Ladder",
      focus: "Consumer Tech, Innovation"
    },
    {
      name: "Kunal Shah",
      background: "Founder, CRED",
      investments: "Razorpay, Unacademy, Open",
      focus: "Fintech, Consumer Apps"
    },
    {
      name: "Vijay Shekhar Sharma",
      background: "Founder, Paytm",
      investments: "Ola, GOQii, Doodhwala",
      focus: "Consumer Tech, Fintech"
    },
    {
      name: "Anupam Mittal",
      background: "Founder, Shaadi.com",
      investments: "Ola, Druva, Pretty Secrets",
      focus: "Consumer Internet"
    }
  ];

  const fundingSteps = [
    {
      step: 1,
      title: "Get DPIIT Recognition",
      description: "Register your startup on Startup India portal for eligibility",
      icon: <FileText className="w-6 h-6" />
    },
    {
      step: 2,
      title: "Choose Funding Type",
      description: "Select between grants, loans, equity, or accelerators",
      icon: <Target className="w-6 h-6" />
    },
    {
      step: 3,
      title: "Prepare Documents",
      description: "Business plan, financials, pitch deck, and compliance docs",
      icon: <Briefcase className="w-6 h-6" />
    },
    {
      step: 4,
      title: "Apply & Follow Up",
      description: "Submit applications and track progress actively",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Startup Funding & Grants 2025 | Government Schemes, VCs & Angel Investors"
        description="Access comprehensive funding opportunities for Indian startups - Government grants up to \u20B920Cr, international accelerators, top VCs like Peak XV & Accel, and angel investors. Updated for 2025."
        keywords="startup funding India, government grants, SISFS, CGSS, venture capital, angel investors, Peak XV Partners, Accel India, Tiger Global"
      />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                  <Rocket className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Startup Funding & Grants
                </h1>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl">
                Access Government Grants up to {"\u20B9"}20 Crores, International Programs, and connect with Top VCs & Angels.
              </p>
            </div>
            
            <div className="flex gap-3">
               <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                 <FileText className="w-4 h-4 mr-2" />
                 Apply for Funding
               </Button>
               <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold">
                 <Briefcase className="w-4 h-4 mr-2" />
                 Consult Expert
               </Button>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-purple-50 border-purple-100 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-700">{"\u20B9"}10,000Cr</div>
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total Fund Corpus</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-100 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-700">25+</div>
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Funding Sources</div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-700">217</div>
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">SISFS Incubators</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-100 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-700">{"\u20B9"}20Cr</div>
                <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">Max CGSS Loan</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Funding Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Your Funding Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {fundingSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                        {item.icon}
                      </div>
                      <div className="text-2xl font-bold text-gray-400">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Funding Categories Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="government">Government Schemes</TabsTrigger>
            <TabsTrigger value="international">International Programs</TabsTrigger>
            <TabsTrigger value="vc">Venture Capital</TabsTrigger>
            <TabsTrigger value="angel">Angel Investors</TabsTrigger>
          </TabsList>

          {/* Government Schemes */}
          <TabsContent value="government">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {governmentSchemes.map((scheme, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`bg-${scheme.color}-100 text-${scheme.color}-700 border-0`}>
                          Government Funded
                        </Badge>
                        <IndianRupee className="w-5 h-5 text-gray-400" />
                      </div>
                      <CardTitle className="text-xl">{scheme.name}</CardTitle>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        {scheme.amount}
                      </div>
                      <CardDescription>{scheme.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Key Highlights</h4>
                          <ul className="space-y-1">
                            {scheme.highlights.map((highlight, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Eligibility</h4>
                          <ul className="space-y-1">
                            {scheme.eligibility.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-600">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => window.open(scheme.link, '_blank')}
                        >
                          Apply Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* International Programs */}
          <TabsContent value="international">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {internationalPrograms.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                          {program.icon}
                        </div>
                        <Badge variant="secondary">{program.type}</Badge>
                      </div>
                      <CardTitle>{program.name}</CardTitle>
                      <CardDescription>{program.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {program.duration}
                        </span>
                        <span>Stage: {program.stage}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Benefits</h4>
                          <ul className="space-y-1">
                            {program.benefits.map((benefit, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start">
                                <ArrowRight className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-semibold">Focus:</span> {program.focus}
                          </p>
                          <Button 
                            className="w-full"
                            onClick={() => window.open(program.link, '_blank')}
                          >
                            Learn More
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Venture Capital */}
          <TabsContent value="vc">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vcFirms.map((vc, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-4xl">{vc.logo}</div>
                        <Badge variant="outline">VC Firm</Badge>
                      </div>
                      <CardTitle>{vc.name}</CardTitle>
                      {vc.formerly !== "-" && (
                        <p className="text-sm text-gray-500">Formerly {vc.formerly}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Investment Focus</p>
                          <p className="text-sm text-gray-600">{vc.focus}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Stage</p>
                          <p className="text-sm text-gray-600">{vc.stage}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Portfolio</p>
                          <p className="text-sm text-gray-600">{vc.portfolio}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Fund Size</p>
                          <p className="text-sm text-gray-600">{vc.aum}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => window.open(vc.website, '_blank')}
                        >
                          Visit Website
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Angel Investors */}
          <TabsContent value="angel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {angelInvestors.map((angel, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Users className="w-8 h-8 text-blue-500" />
                        <Badge>Angel Investor</Badge>
                      </div>
                      <CardTitle>{angel.name}</CardTitle>
                      <CardDescription>{angel.background}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Notable Investments</p>
                          <p className="text-sm text-gray-600">{angel.investments}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Focus Areas</p>
                          <p className="text-sm text-gray-600">{angel.focus}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">How to Connect with Angel Investors</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Build a strong LinkedIn presence and connect professionally</li>
                <li>• Attend startup events, pitch competitions, and networking sessions</li>
                <li>• Get warm introductions through mutual connections</li>
                <li>• Join angel investor networks like Indian Angel Network (IAN)</li>
                <li>• Prepare a compelling pitch deck and executive summary</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Need Help with Funding Applications?
          </h2>
          <p className="text-lg mb-6 text-gray-600">
            Our expert CAs help you navigate the funding landscape and maximize your chances
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/services/funding-assistance">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                Get Funding Assistance
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/startup-services">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                View All Startup Services
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Important Notes */}
        <div className="mt-12 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold mb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
            Important Application Tips
          </h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Always verify current eligibility criteria on official websites before applying</li>
            <li>• Most government schemes require DPIIT recognition - apply first at startupindia.gov.in</li>
            <li>• Prepare comprehensive documentation including business plan, financials, and pitch deck</li>
            <li>• Apply to multiple relevant schemes to maximize funding opportunities</li>
            <li>• Consider hiring professional consultants for complex applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FundingPage;