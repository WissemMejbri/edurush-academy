import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, BookOpen, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Teacher {
  user_id: string;
  full_name: string | null;
  subjects: string[] | null;
}

interface BookSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedTeacher?: Teacher | null;
}

const subjects = [
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "english", label: "English" },
  { value: "economics", label: "Economics" },
  { value: "business", label: "Business Studies" },
  { value: "computer-science", label: "Computer Science" },
];

const levels = [
  { value: "IGCSE", label: "Cambridge IGCSE" },
  { value: "AS Level", label: "AS Level" },
  { value: "A Level", label: "A Level" },
  { value: "IB SL", label: "IB Standard Level" },
  { value: "IB HL", label: "IB Higher Level" },
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export function BookSessionDialog({ open, onOpenChange, preselectedTeacher }: BookSessionDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [formData, setFormData] = useState({
    teacher_id: preselectedTeacher?.user_id || "",
    subject: "",
    level: "",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (preselectedTeacher) {
      setFormData(prev => ({ ...prev, teacher_id: preselectedTeacher.user_id }));
    }
  }, [preselectedTeacher]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, subjects")
        .not("subjects", "is", null);
      
      if (data) setTeachers(data as Teacher[]);
    };
    
    if (open) fetchTeachers();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("booking_sessions").insert({
        student_id: user.id,
        teacher_id: formData.teacher_id,
        subject: formData.subject,
        level: formData.level,
        requested_date: formData.date,
        requested_time: formData.time,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: t("booking.success"),
        description: t("booking.successDesc"),
      });
      
      onOpenChange(false);
      setFormData({ teacher_id: "", subject: "", level: "", date: "", time: "", notes: "" });
    } catch (err: any) {
      toast({
        title: t("booking.error"),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t("booking.title")}</DialogTitle>
          <DialogDescription>{t("booking.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Tutor Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent" />
              {t("booking.selectTutor")}
            </Label>
            <Select
              value={formData.teacher_id}
              onValueChange={(v) => setFormData({ ...formData, teacher_id: v })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={t("booking.chooseTutor")} />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.user_id} value={teacher.user_id}>
                    {teacher.full_name || "Unnamed Tutor"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject & Level Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                {t("booking.subject")}
              </Label>
              <Select
                value={formData.subject}
                onValueChange={(v) => setFormData({ ...formData, subject: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("booking.chooseSubject")} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("booking.level")}</Label>
              <Select
                value={formData.level}
                onValueChange={(v) => setFormData({ ...formData, level: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("booking.chooseLevel")} />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                {t("booking.date")}
              </Label>
              <Input
                type="date"
                min={minDate}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                {t("booking.time")}
              </Label>
              <Select
                value={formData.time}
                onValueChange={(v) => setFormData({ ...formData, time: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("booking.chooseTime")} />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t("booking.notes")}</Label>
            <Textarea
              placeholder={t("booking.notesPlaceholder")}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "..." : t("booking.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
