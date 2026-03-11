import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Play,
  BookOpen,
  Video,
  Newspaper,
  ChevronRight,
  Star,
  Clock,
  Users,
  TrendingUp,
  Award,
  GraduationCap,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { VIDEO_TUTORIALS, getPopularVideos } from "@/data/video-tutorials";
import { TAX_GUIDES } from "@/data/tax-guides";
import { EXPERTS } from "@/data/experts";

export default function LearnPage() {
  const popularVideos = getPopularVideos(3);
  const popularGuides = TAX_GUIDES.slice(0, 3);
  const featuredExperts = EXPERTS.filter(e => e.featured).slice(0, 3);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-overlay animate-pulse" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl mix-blend-overlay animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <Breadcrumb className="mb-8 opacity-80 hover:opacity-100 transition-opacity">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-indigo-200 hover:text-white transition-colors">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-indigo-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium">Learn</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <GraduationCap className="h-5 w-5 text-indigo-300" />
                <span className="text-sm font-medium text-indigo-100">SmartTax Learning Hub</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Taxes</span>
              </h1>
              <p className="text-xl text-indigo-100/90 mb-8 leading-relaxed max-w-xl">
                Expert-led tutorials, interactive guides, and professional consultations to help you navigate the complex world of taxation with confidence.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Start Learning
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 rounded-xl backdrop-blur-sm">
                  Browse Topics
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Video Tutorials", value: `${VIDEO_TUTORIALS.length}+`, icon: Play, color: "bg-red-500" },
                { label: "Tax Guides", value: `${TAX_GUIDES.length}+`, icon: BookOpen, color: "bg-emerald-500" },
                { label: "Expert CAs", value: `${EXPERTS.length}`, icon: Users, color: "bg-purple-500" },
                { label: "Happy Learners", value: "50K+", icon: TrendingUp, color: "bg-blue-500" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/15 transition-colors">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-indigo-200">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Learning Paths - Bento Grid */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Learning Path</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Select the learning style that suits you best. From visual tutorials to detailed reading materials.</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Link href="/learn/videos">
              <motion.div variants={item} className="h-full">
                <Card className="h-full group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-md bg-gradient-to-b from-white to-red-50/30 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-5 w-5 text-red-400" />
                  </div>
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Play className="h-8 w-8 text-red-600 fill-red-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-red-600 transition-colors">
                      Video Tutorials
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Watch expert-led videos on tax filing, savings, and investments.
                    </p>
                    <div className="flex items-center text-sm font-medium text-red-600 bg-red-50 w-fit px-3 py-1 rounded-full">
                      <Clock className="h-3 w-3 mr-1.5" />
                      {VIDEO_TUTORIALS.length}+ videos
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            <Link href="/learn/guides">
              <motion.div variants={item} className="h-full">
                <Card className="h-full group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-md bg-gradient-to-b from-white to-emerald-50/30 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                  </div>
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <BookOpen className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-emerald-600 transition-colors">
                      Interactive Guides
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Step-by-step guides with checklists to master tax concepts.
                    </p>
                    <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                      {TAX_GUIDES.length}+ guides
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            <Link href="/learn/consultations">
              <motion.div variants={item} className="h-full">
                <Card className="h-full group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-md bg-gradient-to-b from-white to-purple-50/30 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-5 w-5 text-purple-400" />
                  </div>
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Video className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                      Expert Consultation
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Book 1-on-1 video calls with certified Chartered Accountants.
                    </p>
                    <div className="flex items-center text-sm font-medium text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full">
                      <Users className="h-3 w-3 mr-1.5" />
                      {EXPERTS.length} experts
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            <Link href="/blog">
              <motion.div variants={item} className="h-full">
                <Card className="h-full group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-md bg-gradient-to-b from-white to-blue-50/30 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-5 w-5 text-blue-400" />
                  </div>
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Newspaper className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                      Tax Blog & News
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Latest tax updates, budget news, and expert articles.
                    </p>
                    <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3 mr-1.5" />
                      Weekly updates
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        </section>

        {/* Popular Videos */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Play className="h-5 w-5 text-red-600 fill-red-600" />
                </div>
                Popular Videos
              </h2>
              <p className="text-gray-500 mt-1 ml-11">Most watched tutorials this week</p>
            </div>
            <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" asChild>
              <Link href="/learn/videos">View All <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularVideos.map((video) => (
              <Card key={video.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
                  <div className="bg-gradient-to-br from-slate-700 to-slate-900 w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-white fill-white" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md border-none z-20">{video.duration}</Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500 font-medium">{video.instructor}</p>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Beginner</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Guides */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                Step-by-Step Guides
              </h2>
              <p className="text-gray-500 mt-1 ml-11">Comprehensive reading materials</p>
            </div>
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" asChild>
              <Link href="/learn/guides">View All <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularGuides.map((guide) => (
              <Link key={guide.id} href={`/learn/guide/${guide.slug}`}>
                <Card className="h-full group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 shadow-sm hover:border-emerald-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{guide.category}</Badge>
                      <div className="p-2 bg-gray-50 rounded-full group-hover:bg-emerald-50 transition-colors">
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600" />
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-emerald-700 transition-colors leading-tight">
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-base mt-2">{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-50">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {guide.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                        {guide.steps.length} steps
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Experts */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                Our Tax Experts
              </h2>
              <p className="text-gray-500 mt-1 ml-11">Get personalized advice</p>
            </div>
            <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50" asChild>
              <Link href="/learn/consultations">View All <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredExperts.map((expert) => (
              <Card key={expert.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 flex flex-col items-center text-center border-b border-purple-100">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-white">
                      {expert.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{expert.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{expert.title}</p>
                    <div className="flex items-center gap-1 mt-2 bg-white px-3 py-1 rounded-full shadow-sm">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-gray-700">{expert.rating}</span>
                      <span className="text-xs text-gray-400">({expert.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                      {expert.specializations.slice(0, 3).map((spec, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">{spec}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-500">{expert.experience} years exp</span>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700" asChild>
                        <Link href="/learn/consultations">Book Call</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 p-12 md:p-20 text-center text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                Still Have Questions?
              </h2>
              <p className="text-indigo-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                Can't find what you're looking for? Our AI Tax Assistant can help you with instant answers,
                or book a consultation with our expert CAs for personalized advice.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold h-14 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link href="/tax-assistant">
                    Ask AI Assistant
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8 rounded-xl backdrop-blur-sm" asChild>
                  <Link href="/learn/consultations">
                    Book Expert Call
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
