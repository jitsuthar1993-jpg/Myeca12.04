import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "wouter";
import {
  Video,
  Star,
  Clock,
  MessageSquare,
  FileText,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle,
  Calendar as CalendarIcon,
  User,
  Globe,
  Award,
  IndianRupee,
  Phone
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { EXPERTS, CONSULTATION_TYPES, Expert, ConsultationType, getAvailableSlots } from "@/data/experts";

const CONSULTATION_ICONS: Record<string, React.ReactNode> = {
  'MessageSquare': <MessageSquare className="h-5 w-5" />,
  'FileText': <FileText className="h-5 w-5" />,
  'TrendingUp': <TrendingUp className="h-5 w-5" />,
  'Building2': <Building2 className="h-5 w-5" />,
  'AlertTriangle': <AlertTriangle className="h-5 w-5" />,
};

export default function ConsultationsPage() {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
  });

  // Get available slots for selected expert and date
  const availableSlots = selectedExpert && selectedDate 
    ? getAvailableSlots(selectedExpert.id, selectedDate)
    : [];

  // Start booking process
  const startBooking = (expert: Expert) => {
    setSelectedExpert(expert);
    setIsBookingOpen(true);
    setBookingStep(1);
  };

  // Format price
  const formatPrice = (price: number) => `\u20B9${price.toLocaleString('en-IN')}`;

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  // Expert card
  const ExpertCard = ({ expert }: { expert: Expert }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {expert.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{expert.name}</h3>
                <p className="text-sm text-gray-500">{expert.title}</p>
              </div>
              {expert.featured && (
                <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              {renderStars(expert.rating)}
              <span className="text-sm text-gray-500">({expert.reviewCount} reviews)</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-3">
              {expert.specializations.slice(0, 4).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {expert.experience} years exp
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {expert.languages.join(', ')}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{expert.bio}</p>
            
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-sm text-gray-500">Starting from</span>
                <p className="text-xl font-bold text-green-600">{formatPrice(expert.consultationFee)}</p>
              </div>
              <Button onClick={() => startBooking(expert)}>
                Book Consultation
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-purple-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-purple-300" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/learn" className="text-purple-200 hover:text-white">Learn</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-purple-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Expert Consultations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Video className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Expert Tax Consultations</h1>
              <p className="text-purple-200 mt-1">
                Book a video call with certified Chartered Accountants
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8 max-w-2xl">
            <div className="text-center">
              <p className="text-2xl font-bold">{EXPERTS.length}</p>
              <p className="text-sm text-purple-200">Experts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-purple-200">Avg Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">5000+</p>
              <p className="text-sm text-purple-200">Consultations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">\u20B9299</p>
              <p className="text-sm text-purple-200">Starting at</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Consultation Types */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Choose Consultation Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CONSULTATION_TYPES.map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedType?.id === type.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedType(type)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    {CONSULTATION_ICONS[type.icon]}
                  </div>
                  <h3 className="font-semibold text-sm">{type.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{type.duration} mins</p>
                  <p className="text-lg font-bold text-purple-600 mt-2">{formatPrice(type.price)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Expert List */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Our Tax Experts</h2>
          <div className="space-y-6">
            {EXPERTS.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-6 text-center">Why Book with Us?</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Verified CAs</h3>
                  <p className="text-sm text-gray-600 mt-1">All experts are certified Chartered Accountants</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Video Calls</h3>
                  <p className="text-sm text-gray-600 mt-1">Face-to-face consultation from anywhere</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Flexible Timing</h3>
                  <p className="text-sm text-gray-600 mt-1">Book slots that suit your schedule</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Satisfaction Guaranteed</h3>
                  <p className="text-sm text-gray-600 mt-1">100% refund if not satisfied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {bookingStep === 1 && 'Select Consultation Type'}
              {bookingStep === 2 && 'Choose Date & Time'}
              {bookingStep === 3 && 'Your Details'}
              {bookingStep === 4 && 'Confirm Booking'}
            </DialogTitle>
            <DialogDescription>
              Booking with {selectedExpert?.name}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Consultation Type */}
          {bookingStep === 1 && (
            <div className="space-y-4">
              <RadioGroup 
                value={selectedType?.id || ''} 
                onValueChange={(v) => setSelectedType(CONSULTATION_TYPES.find(t => t.id === v) || null)}
              >
                {CONSULTATION_TYPES.map((type) => (
                  <div 
                    key={type.id}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <RadioGroupItem value={type.id} id={type.id} />
                    <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{type.name}</p>
                          <p className="text-sm text-gray-500">{type.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{type.duration} minutes</p>
                        </div>
                        <p className="text-lg font-bold text-purple-600">{formatPrice(type.price)}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {bookingStep === 2 && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label className="mb-2 block">Available Slots</Label>
                {selectedDate ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedSlot === slot ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No slots available for this date</p>
                  )
                ) : (
                  <p className="text-gray-500 text-sm">Please select a date first</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: User Details */}
          {bookingStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={userDetails.phone}
                  onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="description">Brief Description of Your Query</Label>
                <Textarea 
                  id="description"
                  value={userDetails.description}
                  onChange={(e) => setUserDetails({...userDetails, description: e.target.value})}
                  placeholder="Briefly describe what you need help with..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {bookingStep === 4 && (
            <div className="space-y-4">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expert</span>
                      <span className="font-medium">{selectedExpert?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultation</span>
                      <span className="font-medium">{selectedType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{selectedType?.duration} minutes</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-purple-600">{formatPrice(selectedType?.price || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-gray-500">
                By clicking "Confirm Booking", you agree to our terms and conditions. 
                You will receive a confirmation email with the meeting link.
              </p>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            {bookingStep > 1 && (
              <Button variant="outline" onClick={() => setBookingStep(bookingStep - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {bookingStep < 4 ? (
              <Button 
                onClick={() => setBookingStep(bookingStep + 1)}
                disabled={
                  (bookingStep === 1 && !selectedType) ||
                  (bookingStep === 2 && (!selectedDate || !selectedSlot)) ||
                  (bookingStep === 3 && (!userDetails.name || !userDetails.email || !userDetails.phone))
                }
              >
                Continue
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

