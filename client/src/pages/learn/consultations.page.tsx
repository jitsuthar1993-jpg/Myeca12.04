import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "wouter";
import {
  Video,
  Clock,
  MessageSquare,
  FileText,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { EXPERTS, CONSULTATION_TYPES, Expert, ConsultationType, getAvailableSlots } from "@/data/experts";
import { buildConsultationHref } from "@/lib/consultation-handoff";

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
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')} excluding GST`;
  const consultationService = selectedType?.id === "business-consultation"
    ? "business-tax-review"
    : "tax-consultation";
  const supportRequestHref = buildConsultationHref(consultationService, {
    source: "learn-consultations",
    team: selectedExpert?.id,
    type: selectedType?.id,
    date: selectedDate,
    time: selectedSlot,
  });

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
                <p className="text-sm text-slate-500">{expert.title}</p>
              </div>
              {expert.featured && (
                <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>
              )}
            </div>

            <p className="mt-2 text-sm text-slate-500">Scope and document requirements shown before booking</p>

            <div className="flex flex-wrap gap-1 mt-3">
              {expert.specializations.slice(0, 4).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Document-led review
              </span>
            </div>

            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{expert.bio}</p>

            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-sm text-slate-500">Indicative fee</span>
                <p className="text-xl font-bold text-green-600">{formatPrice(expert.consultationFee)}</p>
              </div>
              <Button onClick={() => startBooking(expert)}>
                Request Consultation
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 ">
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
                Request a video consultation for a defined tax question and document set
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8 max-w-2xl">
            <div className="text-center">
              <p className="text-2xl font-bold">{EXPERTS.length}</p>
              <p className="text-sm text-purple-200">Consultation Areas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">Scope</p>
              <p className="text-sm text-purple-200">Reviewed First</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">Private</p>
              <p className="text-sm text-purple-200">Case Notes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">₹299</p>
              <p className="text-sm text-purple-200">Indicative fee</p>
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
                  <p className="text-xs text-slate-500 mt-1">{type.duration} mins</p>
                  <p className="text-lg font-bold text-purple-600 mt-2">{formatPrice(type.price)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Expert List */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Tax Consultation Services</h2>
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
              <h2 className="text-xl font-semibold mb-6 text-center">How the Request Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Scope Before Payment</h3>
                  <p className="text-sm text-slate-600 mt-1">Confirm the question, document list, and deliverable before booking.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Video Calls</h3>
                  <p className="text-sm text-slate-600 mt-1">Face-to-face consultation from anywhere</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Preferred Windows</h3>
                  <p className="text-sm text-slate-600 mt-1">Share a suitable date and time for follow-up</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Clear Scope</h3>
                  <p className="text-sm text-slate-600 mt-1">Refund eligibility shown before payment</p>
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
              {bookingStep === 2 && 'Choose Preferred Date & Time'}
              {bookingStep === 3 && 'Review Request'}
            </DialogTitle>
            <DialogDescription>
              Requesting support from {selectedExpert?.name}
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
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50"
                  >
                    <RadioGroupItem value={type.id} id={type.id} />
                    <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{type.name}</p>
                          <p className="text-sm text-slate-500">{type.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{type.duration} minutes</p>
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
                <Label className="mb-2 block">Preferred Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label className="mb-2 block">Preferred Request Windows</Label>
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
                    <p className="text-slate-500 text-sm">No request windows listed for this date</p>
                  )
                ) : (
                  <p className="text-slate-500 text-sm">Please select a date first</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Request Review */}
          {bookingStep === 3 && (
            <div className="space-y-4">
              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Request Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service team</span>
                      <span className="font-medium">{selectedExpert?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Consultation</span>
                      <span className="font-medium">{selectedType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Preferred date</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Preferred time</span>
                      <span className="font-medium">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-medium">{selectedType?.duration} minutes</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Indicative fee</span>
                      <span className="font-bold text-purple-600">{formatPrice(selectedType?.price || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-slate-500">
                Availability, final scope, fee, and payment are confirmed after review.
                Continue to the support form to send your contact details and question.
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
            {bookingStep < 3 ? (
              <Button
                onClick={() => setBookingStep(bookingStep + 1)}
                disabled={
                  (bookingStep === 1 && !selectedType) ||
                  (bookingStep === 2 && (!selectedDate || !selectedSlot))
                }
              >
                Continue
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700" asChild>
                <Link href={supportRequestHref}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continue to Support Request
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
