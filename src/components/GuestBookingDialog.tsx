import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon, Clock, BookOpen, ChevronRight, ChevronLeft, FileText, User, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface GuestBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const subjects = [
  { value: "Mathematics", label: "Mathematics" },
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
  { value: "English", label: "English" },
  { value: "French", label: "French" },
  { value: "Arabic", label: "Arabic" },
  { value: "Economics", label: "Economics" },
  { value: "Business Studies", label: "Business Studies" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Psychology", label: "Psychology" },
  { value: "History", label: "History" },
  { value: "Geography", label: "Geography" },
  { value: "Art & Design", label: "Art & Design" },
];

const levels = [
  { value: "IGCSE", label: "Cambridge IGCSE" },
  { value: "AS Level", label: "AS Level" },
  { value: "A Level", label: "A Level" },
  { value: "IB SL", label: "IB Standard Level" },
  { value: "IB HL", label: "IB Higher Level" },
];

const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const h = i + 8;
  return `${String(h).padStart(2, "0")}:00`;
});

const STEPS = ["Your Info", "Program", "Date & Time", "Notes", "Confirm"];

export function GuestBookingDialog({ open, onOpenChange }: GuestBookingDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    level: "",
    date: undefined as Date | undefined,
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("guest_booking_requests" as any).insert({
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        subject: formData.subject,
        level: formData.level,
        requested_date: format(formData.date!, "yyyy-MM-dd"),
        requested_time: formData.time,
        notes: formData.notes.trim() || null,
        is_guest: true,
        status: "pending",
      } as any);

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: "Your tutoring request has been received. Our team will contact you shortly.",
      });
      onOpenChange(false);
      setFormData({ fullName: "", email: "", phone: "", subject: "", level: "", date: undefined, time: "", notes: "" });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canNext = () => {
    switch (step) {
      case 0: return formData.fullName.trim().length >= 2 && isValidEmail(formData.email);
      case 1: return !!formData.subject && !!formData.level;
      case 2: return !!formData.date && !!formData.time;
      case 3: return true;
      default: return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] h-full sm:h-auto flex flex-col overflow-hidden p-0 sm:p-0 gap-0">
        <div className="p-4 sm:p-6 pb-0 sm:pb-0">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{t("booking.title")}</DialogTitle>
            <DialogDescription>No account needed — fill in your details and we'll get back to you.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-1.5 mt-4 mb-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1 flex-1">
                <div className={cn(
                  "h-2 rounded-full w-full transition-colors",
                  i <= step ? "bg-accent" : "bg-muted"
                )} />
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Contact Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4 text-accent" /> Full Name *
                    </Label>
                    <Input
                      value={formData.fullName}
                      onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="Your full name"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" /> Email Address *
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-accent" /> Phone Number (optional)
                    </Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      maxLength={20}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Subject & Level */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent" /> {t("booking.subject")}
                    </Label>
                    <Select value={formData.subject} onValueChange={v => setFormData(p => ({ ...p, subject: v }))}>
                      <SelectTrigger><SelectValue placeholder={t("booking.chooseSubject")} /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("booking.level")}</Label>
                    <Select value={formData.level} onValueChange={v => setFormData(p => ({ ...p, level: v }))}>
                      <SelectTrigger><SelectValue placeholder={t("booking.chooseLevel")} /></SelectTrigger>
                      <SelectContent>
                        {levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-accent" /> Preferred Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left", !formData.date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={d => setFormData(p => ({ ...p, date: d }))}
                          disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" /> Preferred Time
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setFormData(p => ({ ...p, time: slot }))}
                          className={cn(
                            "py-3 px-3 rounded-lg border text-sm font-medium transition-all min-h-[44px]",
                            formData.time === slot
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border hover:border-accent/50 text-foreground"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This is your preferred time. Final scheduling will be confirmed by our team.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Notes */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" /> Additional Notes (optional)
                    </Label>
                    <Textarea
                      placeholder="Any specific topics, goals, or preferences you'd like us to know..."
                      value={formData.notes}
                      onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                      rows={5}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      Share any details that will help us match you with the right tutor.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium text-foreground">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium text-foreground">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium text-foreground">{formData.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Program</span>
                      <span className="font-medium text-foreground">{formData.subject} — {formData.level}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preferred Date</span>
                      <span className="font-medium text-foreground">{formData.date ? format(formData.date, "PPP") : "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preferred Time</span>
                      <span className="font-medium text-foreground">{formData.time}</span>
                    </div>
                    {formData.notes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Notes</span>
                        <span className="font-medium text-foreground text-right max-w-[60%]">{formData.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                    <p className="text-sm text-foreground">
                      By submitting, you are requesting a tutoring session. Our team will review your request and contact you at <strong>{formData.email}</strong> to confirm details.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between p-4 sm:p-6 pt-3 sm:pt-3 border-t border-border bg-background shrink-0">
          <Button
            variant="outline"
            onClick={() => step > 0 ? setStep(s => s - 1) : onOpenChange(false)}
            className="gap-1 min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-1 min-h-[44px]">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="min-h-[44px]">
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
