import { CheckCircle, Clock, Search, ClipboardCheck, Banknote, XCircle } from "lucide-react";

interface BookingStatusTrackerProps {
  paymentStatus: string;
  inspectionStatus: string;
  inspectionDate?: string;
  inspectionNotes?: string;
}

const steps = [
  {
    id: "payment_submitted",
    label: "Payment Submitted",
    description: "Your payment has been submitted",
    icon: Clock,
  },
  {
    id: "payment_verified",
    label: "Payment Verified",
    description: "We have verified your payment",
    icon: CheckCircle,
  },
  {
    id: "scheduled",
    label: "Inspection Scheduled",
    description: "Property inspection has been scheduled",
    icon: Search,
  },
  {
    id: "in_progress",
    label: "Inspection In Progress",
    description: "Our team is inspecting the property",
    icon: ClipboardCheck,
  },
  {
    id: "approved",
    label: "Approved & Payment Released",
    description: "Property verified, payment released to agent",
    icon: Banknote,
  },
];

const getStepIndex = (paymentStatus: string, inspectionStatus: string): number => {
  if (inspectionStatus === "approved" || inspectionStatus === "completed") return 4;
  if (inspectionStatus === "in_progress") return 3;
  if (inspectionStatus === "scheduled") return 2;
  if (inspectionStatus === "payment_verified" || paymentStatus === "verified") return 1;
  if (paymentStatus === "submitted" || paymentStatus === "pending") return 0;
  return -1;
};

const BookingStatusTracker = ({
  paymentStatus,
  inspectionStatus,
  inspectionDate,
  inspectionNotes,
}: BookingStatusTrackerProps) => {
  const currentStepIndex = getStepIndex(paymentStatus, inspectionStatus);
  const isRejected = inspectionStatus === "rejected";

  return (
    <div className="space-y-4">
      {/* Status Steps */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex gap-4 pb-6 last:pb-0">
              {/* Vertical Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[40px] ${
                      isCompleted ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-1 pb-4">
                <h4
                  className={`font-medium ${
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step.description}
                </p>
                
                {/* Show inspection date if scheduled */}
                {step.id === "scheduled" && inspectionDate && (isCurrent || isCompleted) && (
                  <div className="mt-2 bg-primary/10 rounded-lg px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Scheduled for: </span>
                    <span className="font-medium text-foreground">
                      {new Date(inspectionDate).toLocaleDateString("en-NG", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejected State */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-red-800">Inspection Failed</h4>
              <p className="text-sm text-red-600 mt-1">
                The property did not meet our verification standards. Your payment will be refunded.
              </p>
              {inspectionNotes && (
                <div className="mt-2 bg-white rounded-lg p-3 border border-red-100">
                  <p className="text-xs text-muted-foreground mb-1">Notes from inspector:</p>
                  <p className="text-sm text-foreground">{inspectionNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes if any */}
      {inspectionNotes && !isRejected && inspectionStatus === "approved" && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Inspector notes:</p>
          <p className="text-sm text-foreground">{inspectionNotes}</p>
        </div>
      )}
    </div>
  );
};

export default BookingStatusTracker;
