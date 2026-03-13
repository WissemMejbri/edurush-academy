import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, User, BookOpen, Check, X, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

interface BookingSession {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  level: string;
  requested_date: string;
  requested_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  zoom_link: string | null;
  student_name?: string;
  proposed_date?: string | null;
  proposed_time?: string | null;
}

interface BookingRequestCardProps {
  session: BookingSession;
  onStatusChange: () => void;
  variant?: "teacher" | "student";
}

export function BookingRequestCard({ session, onStatusChange, variant = "teacher" }: BookingRequestCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showProposeDialog, setShowProposeDialog] = useState(false);
  const [zoomLink, setZoomLink] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [proposeMessage, setProposeMessage] = useState("");

  const endTime = (time: string, duration: number) => {
    const [h, m] = time.split(":").map(Number);
    const totalMin = h * 60 + m + duration;
    return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("booking_sessions")
        .update({ status: "accepted", zoom_link: zoomLink || null })
        .eq("id", session.id);
      if (error) throw error;

      supabase.functions.invoke("booking-notifications", {
        body: { session_id: session.id, event_type: "accepted", zoom_link: zoomLink || undefined },
      }).catch(console.error);

      toast({ title: t("booking.accepted"), description: t("booking.acceptedDesc") });
      setShowAcceptDialog(false);
      onStatusChange();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("booking_sessions")
        .update({ status: "declined" })
        .eq("id", session.id);
      if (error) throw error;

      supabase.functions.invoke("booking-notifications", {
        body: { session_id: session.id, event_type: "declined" },
      }).catch(console.error);

      toast({ title: t("booking.declined"), description: t("booking.declinedDesc") });
      onStatusChange();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePropose = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("booking_sessions")
        .update({
          status: "pending",
          proposed_date: proposedDate || null,
          proposed_time: proposedTime || null,
          notes: proposeMessage ? `[Teacher proposal] ${proposeMessage}` : session.notes,
        })
        .eq("id", session.id);
      if (error) throw error;

      toast({ title: "New time proposed", description: "The student will be notified." });
      setShowProposeDialog(false);
      onStatusChange();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("booking_sessions")
        .update({ status: "cancelled" })
        .eq("id", session.id);
      if (error) throw error;

      supabase.functions.invoke("booking-notifications", {
        body: { session_id: session.id, event_type: "cancelled" },
      }).catch(console.error);

      toast({ title: t("booking.cancelled") });
      onStatusChange();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric",
    });
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4 premium-shadow-sm">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="font-semibold text-foreground truncate">{session.subject} — {session.level}</span>
            </div>
            <StatusBadge status={session.status} />
          </div>

          {variant === "teacher" && session.student_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4 flex-shrink-0" />
              <span>{session.student_name}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              {formatDate(session.requested_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 flex-shrink-0" />
              {session.requested_time} – {endTime(session.requested_time, session.duration_minutes)}
            </span>
            <span className="text-xs">{session.duration_minutes / 60}h</span>
          </div>

          {session.notes && (
            <p className="text-sm text-muted-foreground italic break-words">"{session.notes}"</p>
          )}

          {session.proposed_date && (
            <p className="text-xs text-accent font-medium">
              📅 Proposed: {formatDate(session.proposed_date)} at {session.proposed_time}
            </p>
          )}

          {session.status === "accepted" && session.zoom_link && (
            <a href={session.zoom_link} target="_blank" rel="noopener noreferrer"
              className="text-sm text-accent hover:underline">
              🔗 Join Session
            </a>
          )}

          {variant === "teacher" && session.status === "pending" && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => setShowAcceptDialog(true)} disabled={loading} className="gap-1 min-h-[40px]">
                <Check className="w-4 h-4" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowProposeDialog(true)} disabled={loading} className="gap-1 min-h-[40px]">
                <MessageSquare className="w-4 h-4" /> Propose
              </Button>
              <Button size="sm" variant="outline" onClick={handleDecline} disabled={loading} className="gap-1 text-destructive min-h-[40px]">
                <X className="w-4 h-4" /> Decline
              </Button>
            </div>
          )}

          {variant === "student" && session.status === "pending" && (
            <div className="pt-1">
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={loading} className="min-h-[40px]">
                {t("booking.cancel")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("booking.confirmAccept")}</DialogTitle>
            <DialogDescription>{t("booking.confirmAcceptDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("booking.zoomLink")}</Label>
              <Input placeholder="https://zoom.us/j/..." value={zoomLink} onChange={e => setZoomLink(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t("booking.zoomLinkHint")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>Cancel</Button>
            <Button onClick={handleAccept} disabled={loading}>{loading ? "..." : t("booking.confirmAndAccept")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Propose New Time Dialog */}
      <Dialog open={showProposeDialog} onOpenChange={setShowProposeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose New Time</DialogTitle>
            <DialogDescription>Suggest an alternative date and time for this session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input type="date" value={proposedDate} onChange={e => setProposedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label>New Time</Label>
                <Input type="time" value={proposedTime} onChange={e => setProposedTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea placeholder="Let the student know why..." value={proposeMessage} onChange={e => setProposeMessage(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProposeDialog(false)}>Cancel</Button>
            <Button onClick={handlePropose} disabled={loading || (!proposedDate && !proposedTime)}>
              {loading ? "..." : "Send Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
