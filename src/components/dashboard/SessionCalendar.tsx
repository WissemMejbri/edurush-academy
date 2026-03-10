import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, Video } from "lucide-react";

interface Session {
  id: string;
  subject: string;
  level: string;
  requested_date: string;
  requested_time: string;
  duration_minutes: number;
  status: string;
  zoom_link: string | null;
  student_name?: string;
}

interface SessionCalendarProps {
  sessions: Session[];
  variant: "student" | "teacher";
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  declined: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  completed: "bg-primary/10 text-primary border-primary/20",
};

export function SessionCalendar({ sessions, variant }: SessionCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const sessionDates = sessions
    .filter(s => s.status !== "cancelled" && s.status !== "declined")
    .map(s => new Date(s.requested_date + "T00:00:00"));

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const daySessions = sessions.filter(s => s.requested_date === selectedDateStr);

  const endTime = (time: string, duration: number) => {
    const [h, m] = time.split(":").map(Number);
    const totalMin = h * 60 + m + duration;
    return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl border border-border p-4 premium-shadow-sm flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="p-3 pointer-events-auto"
          modifiers={{ hasSession: sessionDates }}
          modifiersStyles={{
            hasSession: {
              backgroundColor: "hsl(var(--accent) / 0.15)",
              borderRadius: "50%",
              fontWeight: 700,
            },
          }}
        />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
        <h4 className="font-display text-md font-bold text-foreground mb-4">
          {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a date"}
        </h4>
        {daySessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions on this date.</p>
        ) : (
          <div className="space-y-3">
            {daySessions.map(session => (
              <div key={session.id} className="p-3 rounded-xl border border-border bg-background">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">
                    {session.subject} — {session.level}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[session.status]}`}>
                    {session.status}
                  </span>
                </div>
                {variant === "teacher" && session.student_name && (
                  <p className="text-xs text-muted-foreground mb-1">{session.student_name}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.requested_time} – {endTime(session.requested_time, session.duration_minutes)}
                  </span>
                  <span>{session.duration_minutes / 60}h</span>
                </div>
                {session.status === "accepted" && session.zoom_link && (
                  <a href={session.zoom_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                    <Video className="w-3 h-3" /> Join Session
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
