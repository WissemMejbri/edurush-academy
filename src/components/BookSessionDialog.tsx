import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon, Clock, BookOpen, User, ChevronRight, ChevronLeft, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Teacher {
  user_id: string;
  full_name: string | null;
  subjects: string[] | null;
  avatar_url: string | null;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface BookSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedTeacher?: Teacher | null;
  onBooked?: () => void;
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

const STEPS = ["Subject", "Date & Time", "Confirm"];

export function BookSessionDialog({ open, onOpenChange, preselectedTeacher, onBooked }: BookSessionDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [existingSessions, setExistingSessions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    teacher_id: preselectedTeacher?.user_id || "",
    subject: "",
    level: "",
    date: undefined as Date | undefined,
    time: "",
    duration: 60,
    notes: "",
    record_lesson: false,
  });

  useEffect(() => {
    if (preselectedTeacher) {
      setFormData(prev => ({ ...prev, teacher_id: preselectedTeacher.user_id }));
    }
  }, [preselectedTeacher]);

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }
    const fetchTeachers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, subjects, avatar_url")
        .not("subjects", "is", null);
      if (data) setTeachers(data as Teacher[]);
    };
    fetchTeachers();
  }, [open]);

  // Fetch availability when teacher is selected
  useEffect(() => {
    if (!formData.teacher_id) return;
    const fetchAvail = async () => {
      const { data } = await supabase
        .from("teacher_availability")
        .select("day_of_week, start_time, end_time")
        .eq("teacher_id", formData.teacher_id);
      if (data) setAvailability(data);
    };
    const fetchSessions = async () => {
      const { data } = await supabase
        .from("booking_sessions")
        .select("requested_date, requested_time, duration_minutes, status")
        .eq("teacher_id", formData.teacher_id)
        .in("status", ["pending", "accepted"]);
      if (data) setExistingSessions(data);
    };
    fetchAvail();
    fetchSessions();
  }, [formData.teacher_id]);

  // Auto-assign a teacher based on subject (pick first available)
  const filteredTeachers = formData.subject
    ? teachers.filter(t => t.subjects?.some(s => s.toLowerCase() === formData.subject.toLowerCase()))
    : teachers;

  // Auto-assign teacher when subject changes
  useEffect(() => {
    if (formData.subject && filteredTeachers.length > 0 && !formData.teacher_id) {
      setFormData(p => ({ ...p, teacher_id: filteredTeachers[0].user_id }));
    }
  }, [formData.subject, filteredTeachers.length]);

  // Get available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!formData.date || availability.length === 0) return [];
    const dayOfWeek = formData.date.getDay();
    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek);
    if (daySlots.length === 0) return [];

    const dateStr = format(formData.date, "yyyy-MM-dd");
    const bookedSlots = existingSessions.filter(s => s.requested_date === dateStr);

    const slots: string[] = [];
    for (const slot of daySlots) {
      const [startH] = slot.start_time.split(":").map(Number);
      const [endH] = slot.end_time.split(":").map(Number);
      for (let h = startH; h < endH; h++) {
        const timeStr = `${String(h).padStart(2, "0")}:00`;
        slots.push(timeStr);
      }
    }

    // Remove already booked times
    return slots.filter(time => {
      const [h] = time.split(":").map(Number);
      return !bookedSlots.some(b => {
        const [bh] = b.requested_time.split(":").map(Number);
        const bEnd = bh + b.duration_minutes / 60;
        return h >= bh && h < bEnd;
      });
    });
  }, [formData.date, availability, existingSessions]);

  // Max duration based on availability
  const maxDuration = useMemo(() => {
    if (!formData.time || !formData.date) return 1;
    const [startH] = formData.time.split(":").map(Number);
    const dayOfWeek = formData.date.getDay();
    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek);

    let maxEnd = startH + 1;
    for (const slot of daySlots) {
      const [endH] = slot.end_time.split(":").map(Number);
      if (startH >= Number(slot.start_time.split(":")[0]) && startH < endH) {
        maxEnd = Math.max(maxEnd, endH);
      }
    }

    // Check for booked sessions that would block
    const dateStr = format(formData.date, "yyyy-MM-dd");
    const bookedAfter = existingSessions
      .filter(s => s.requested_date === dateStr)
      .map(s => Number(s.requested_time.split(":")[0]))
      .filter(h => h > startH)
      .sort((a, b) => a - b);

    if (bookedAfter.length > 0) {
      maxEnd = Math.min(maxEnd, bookedAfter[0]);
    }

    return Math.max(1, maxEnd - startH);
  }, [formData.time, formData.date, availability, existingSessions]);

  const durationOptions = Array.from({ length: Math.min(maxDuration, 4) }, (_, i) => i + 1);

  const isDateAvailable = (date: Date) => {
    const day = date.getDay();
    return availability.some(a => a.day_of_week === day) && date >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const endTime = () => {
    if (!formData.time) return "";
    const [h, m] = formData.time.split(":").map(Number);
    const end = h + formData.duration / 60;
    return `${String(Math.floor(end)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error, data } = await supabase.from("booking_sessions").insert({
        student_id: user.id,
        teacher_id: formData.teacher_id,
        subject: formData.subject,
        level: formData.level,
        requested_date: format(formData.date!, "yyyy-MM-dd"),
        requested_time: formData.time,
        duration_minutes: formData.duration,
        notes: formData.notes || null,
      }).select().single();

      if (error) throw error;

      if (data) {
        supabase.functions.invoke("booking-notifications", {
          body: { session_id: data.id, event_type: "booked" },
        }).catch(console.error);
      }

      toast({ title: t("booking.success"), description: t("booking.successDesc") });
      onOpenChange(false);
      onBooked?.();
      setFormData({ teacher_id: "", subject: "", level: "", date: undefined, time: "", duration: 60, notes: "" });
    } catch (err: any) {
      toast({ title: t("booking.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    switch (step) {
      case 0: return !!formData.subject && !!formData.level && !!formData.teacher_id;
      case 1: return !!formData.date && !!formData.time;
      default: return true;
    }
  };

  const selectedTeacher = teachers.find(t => t.user_id === formData.teacher_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t("booking.title")}</DialogTitle>
          <DialogDescription>{t("booking.description")}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={cn(
                "h-1.5 rounded-full flex-1 transition-colors",
                i <= step ? "bg-accent" : "bg-muted"
              )} />
            </div>
          ))}
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-4">
          Step {step + 1}: {STEPS[step]}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Subject & Level */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    {t("booking.subject")}
                  </Label>
                  <Select value={formData.subject} onValueChange={v => setFormData(p => ({ ...p, subject: v, teacher_id: "" }))}>
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

            {/* Step 1: Tutor */}
            {step === 1 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  {t("booking.selectTutor")}
                </Label>
                {filteredTeachers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No tutors available for this subject.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredTeachers.map(teacher => (
                      <button
                        key={teacher.user_id}
                        onClick={() => setFormData(p => ({ ...p, teacher_id: teacher.user_id }))}
                        className={cn(
                          "w-full p-3 rounded-xl border text-left transition-all",
                          formData.teacher_id === teacher.user_id
                            ? "border-accent bg-accent/5 ring-1 ring-accent"
                            : "border-border hover:border-accent/50 hover:bg-muted/50"
                        )}
                      >
                        <span className="font-medium text-sm text-foreground">
                          {teacher.full_name || "Unnamed Tutor"}
                        </span>
                        {teacher.subjects && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {teacher.subjects.join(", ")}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date, Time, Duration */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-accent" />
                    {t("booking.date")}
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
                        onSelect={d => setFormData(p => ({ ...p, date: d, time: "" }))}
                        disabled={d => !isDateAvailable(d)}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {availability.length === 0 && (
                    <p className="text-xs text-amber-600">This tutor hasn't set their availability yet.</p>
                  )}
                </div>

                {formData.date && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      Start Time
                    </Label>
                    {availableTimeSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No available slots on this date.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {availableTimeSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setFormData(p => ({ ...p, time: slot, duration: 60 }))}
                            className={cn(
                              "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                              formData.time === slot
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border hover:border-accent/50 text-foreground"
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {formData.time && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-accent" />
                      Duration
                    </Label>
                    <div className="flex gap-2">
                      {durationOptions.map(h => (
                        <button
                          key={h}
                          onClick={() => setFormData(p => ({ ...p, duration: h * 60 }))}
                          className={cn(
                            "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                            formData.duration === h * 60
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border hover:border-accent/50 text-foreground"
                          )}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.time} → {endTime()} ({formData.duration / 60} hour{formData.duration > 60 ? "s" : ""})
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subject</span>
                    <span className="font-medium text-foreground">{formData.subject} — {formData.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tutor</span>
                    <span className="font-medium text-foreground">{selectedTeacher?.full_name || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">{formData.date ? format(formData.date, "PPP") : "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{formData.time} → {endTime()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{formData.duration / 60} hour{formData.duration > 60 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("booking.notes")}</Label>
                  <Textarea
                    placeholder={t("booking.notesPlaceholder")}
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => step > 0 ? setStep(s => s - 1) : onOpenChange(false)}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Booking..." : t("booking.submit")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
