import { motion } from "framer-motion"
import { Sparkles, Zap, MousePointer } from "lucide-react"
import { AnimatedFormExample } from "@/components/examples/AnimatedFormExample"

export default function FormDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Micro-animations Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience smooth, delightful form interactions with our enhanced components featuring 
              micro-animations, focus states, validation feedback, and interactive elements.
            </p>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <motion.div
                className="bg-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Focus Animations</h3>
                <p className="text-gray-600 text-sm">Smooth scale transforms and ring effects on field focus</p>
              </motion.div>
              
              <motion.div
                className="bg-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <MousePointer className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Hover Effects</h3>
                <p className="text-gray-600 text-sm">Subtle hover animations with smooth transitions</p>
              </motion.div>
              
              <motion.div
                className="bg-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Validation Feedback</h3>
                <p className="text-gray-600 text-sm">Animated validation messages with icons and colors</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form Demo */}
      <section className="pb-16">
        <AnimatedFormExample />
      </section>

      {/* Implementation Notes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Implementation Features</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white p-8 rounded-lg shadow-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enhanced Input Fields</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Smooth focus transitions with scale effects</li>
                <li>• Dynamic border colors and shadow states</li>
                <li>• Background color changes based on field state</li>
                <li>• Animated focus rings with spring physics</li>
                <li>• Loading indicators and success states</li>
              </ul>
            </motion.div>
            
            <motion.div
              className="bg-white p-8 rounded-lg shadow-md"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Components</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Animated select dropdowns with smooth transitions</li>
                <li>• Button ripple effects on press</li>
                <li>• Form validation with animated error messages</li>
                <li>• Success checkmarks with path drawing animations</li>
                <li>• Consistent hover and active states</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}