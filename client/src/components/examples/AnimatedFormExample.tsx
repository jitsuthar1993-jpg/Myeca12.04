import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { User, Mail, Phone, Calendar, Building, MapPin } from "lucide-react"

import { AnimatedForm, AnimatedFormField } from "@/components/ui/animated-form"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedSelect, AnimatedSelectContent, AnimatedSelectItem, AnimatedSelectTrigger, AnimatedSelectValue } from "@/components/ui/animated-select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  experience: z.string().min(1, "Please select experience level"),
  location: z.string().min(1, "Location is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type FormData = z.infer<typeof formSchema>

export function AnimatedFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      experience: "",
      location: "",
      message: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log("Form data:", data)
    setIsSubmitting(false)
    setIsSuccess(true)
    
    // Reset success state after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Contact Form</CardTitle>
            <CardDescription className="text-gray-600">
              Experience smooth micro-animations on every field interaction
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <Form {...form}>
              <AnimatedForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <AnimatedFormField
                        label="First Name"
                        error={fieldState.error?.message}
                        required
                      >
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input {...field} placeholder="John" className="pl-10" />
                        </div>
                      </AnimatedFormField>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <AnimatedFormField
                        label="Last Name"
                        error={fieldState.error?.message}
                        required
                      >
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input {...field} placeholder="Doe" className="pl-10" />
                        </div>
                      </AnimatedFormField>
                    )}
                  />
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <AnimatedFormField
                        label="Email Address"
                        error={fieldState.error?.message}
                        success={field.value && !fieldState.error ? "Valid email address" : undefined}
                        required
                      >
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input {...field} type="email" placeholder="john@example.com" className="pl-10" />
                        </div>
                      </AnimatedFormField>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field, fieldState }) => (
                      <AnimatedFormField
                        label="Phone Number"
                        error={fieldState.error?.message}
                        required
                      >
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input {...field} placeholder="+91 9876543210" className="pl-10" />
                        </div>
                      </AnimatedFormField>
                    )}
                  />
                </div>

                {/* Professional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field, fieldState }) => (
                      <AnimatedFormField
                        label="Company"
                        error={fieldState.error?.message}
                        required
                      >
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input {...field} placeholder="Acme Corp" className="pl-10" />
                        </div>
                      </AnimatedFormField>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field, fieldState }) => (
                      <AnimatedFormField
                        label="Position"
                        error={fieldState.error?.message}
                        required
                      >
                        <Input {...field} placeholder="Software Engineer" />
                      </AnimatedFormField>
                    )}
                  />
                </div>

                {/* Select and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field, fieldState }) => (
                      <AnimatedFormField
                        label="Experience Level"
                        error={fieldState.error?.message}
                        required
                      >
                        <AnimatedSelect onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <AnimatedSelectTrigger>
                              <AnimatedSelectValue placeholder="Select experience level" />
                            </AnimatedSelectTrigger>
                          </FormControl>
                          <AnimatedSelectContent>
                            <AnimatedSelectItem value="entry">Entry Level (0-2 years)</AnimatedSelectItem>
                            <AnimatedSelectItem value="mid">Mid Level (3-5 years)</AnimatedSelectItem>
                            <AnimatedSelectItem value="senior">Senior Level (6-10 years)</AnimatedSelectItem>
                            <AnimatedSelectItem value="lead">Lead/Principal (10+ years)</AnimatedSelectItem>
                          </AnimatedSelectContent>
                        </AnimatedSelect>
                      </AnimatedFormField>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field, fieldState }) => (
                      <AnimatedFormField
                        label="Location"
                        error={fieldState.error?.message}
                        required
                      >
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input {...field} placeholder="Mumbai, India" className="pl-10" />
                        </div>
                      </AnimatedFormField>
                    )}
                  />
                </div>

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field, fieldState }) => (
                    <AnimatedFormField
                      label="Message"
                      error={fieldState.error?.message}
                      required
                    >
                      <Textarea
                        {...field}
                        placeholder="Tell us about your requirements..."
                        className="min-h-[120px]"
                      />
                    </AnimatedFormField>
                  )}
                />

                {/* Submit Button */}
                <motion.div
                  className="pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <AnimatedButton
                    type="submit"
                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    loading={isSubmitting}
                    success={isSuccess}
                    disabled={isSubmitting}
                  >
                    {isSuccess ? "Message Sent!" : "Send Message"}
                  </AnimatedButton>
                </motion.div>
              </AnimatedForm>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}