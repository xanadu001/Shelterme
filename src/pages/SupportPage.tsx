import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Shield,
  Home,
  CreditCard,
  AlertTriangle,
  Send,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ElementType;
}

const faqs: FAQItem[] = [
  {
    question: "How does the payment protection work?",
    answer: "When you book a property through ShelterMe, your payment is held securely by us. Our team then inspects and verifies the property on your behalf. Only after the property passes our inspection is the payment released to the agent. This protects you from scams and ensures you get what you paid for.",
    icon: Shield,
  },
  {
    question: "How long does property verification take?",
    answer: "Property verification typically takes 24-72 hours after payment is received. Our team will physically inspect the property to ensure it matches the listing description and meets our quality standards.",
    icon: Clock,
  },
  {
    question: "What if the property doesn't match the listing?",
    answer: "If our inspection reveals that the property doesn't match the listing or doesn't meet our standards, we will notify you immediately and process a full refund. Your protection is our priority.",
    icon: Home,
  },
  {
    question: "How do I get a refund?",
    answer: "Refunds are processed automatically if a property fails our verification. For other refund requests, please contact our support team with your booking reference. Refunds are processed within 24 hours.",
    icon: CreditCard,
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes, all payments are processed securely. We never store your full payment details, and all transactions are encrypted. We only accept payments through our official platform - never pay agents directly.",
    icon: Shield,
  },
  {
    question: "How do I report a suspicious listing?",
    answer: "If you notice a suspicious listing or encounter fraudulent activity, please report it immediately through our support form below or contact us via WhatsApp. We take fraud very seriously and will investigate promptly.",
    icon: AlertTriangle,
  },
];

const SupportPage = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hello ShelterMe Support, I need assistance with...");
    window.open(`https://wa.me/2348012345678?text=${message}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = "tel:+2348012345678";
  };

  const handleEmail = () => {
    window.location.href = "mailto:support@shelterme.ng";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.category || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission (in production, this would go to a support system)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Support request submitted! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", category: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Help & Support</h1>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          We're here to help you 24/7. Choose how you'd like to reach us.
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-6">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleWhatsApp}
            className="bg-background border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-foreground">WhatsApp</span>
          </button>

          <button
            onClick={handleCall}
            className="bg-background border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-foreground">Call Us</span>
          </button>

          <button
            onClick={handleEmail}
            className="bg-background border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-foreground">Email</span>
          </button>
        </div>

        {/* Response Time Notice */}
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3">
          <Clock className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Average response time:</span> WhatsApp &amp; calls are answered within minutes. Email responses within 24 hours.
          </p>
        </div>

        {/* FAQs Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <faq.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground text-sm">{faq.question}</span>
                  </div>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground pl-8">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Form */}
        <div className="bg-background border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Send Us a Message
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for? Send us a message and we'll get back to you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">Your Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Booking Issue</SelectItem>
                  <SelectItem value="payment">Payment & Refunds</SelectItem>
                  <SelectItem value="property">Property Complaint</SelectItem>
                  <SelectItem value="account">Account Issue</SelectItem>
                  <SelectItem value="report">Report Fraud/Scam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-sm">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your issue or question..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit Request"}
            </Button>
          </form>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Report Fraud or Scam</h3>
              <p className="text-sm text-red-700 mb-3">
                If you've been contacted by someone claiming to be from ShelterMe asking for direct payment, 
                or if you suspect fraudulent activity, report it immediately.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => {
                  const message = encodeURIComponent("URGENT: I want to report a potential fraud/scam...");
                  window.open(`https://wa.me/2348012345678?text=${message}`, "_blank");
                }}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SupportPage;
