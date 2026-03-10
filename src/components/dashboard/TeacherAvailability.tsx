import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_OPTIONS = Array.from({ length: 13 }, (_, i) => {
  const h = i + 8;
  return `${String(h).padStart(2, "0")}:00`;
});

interface Slot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export function TeacherAvailability({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: "09:00", end_time: "17:00" });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("teacher_availability")
        .select("*")
        .eq("teacher_id", userId)
        .order("day_of_week");
      if (data) setSlots(data as Slot[]);
    };
    fetch();
  }, [userId]);

  const addSlot = async () => {
    if (newSlot.start_time >= newSlot.end_time) {
      toast({ title: "End time must be after start time", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("teacher_availability")
      .insert({ teacher_id: userId, ...newSlot })
      .select()
      .single();
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else if (data) {
      setSlots(prev => [...prev, data as Slot]);
      toast({ title: "Availability added!" });
    }
    setLoading(false);
  };

  const removeSlot = async (id: string) => {
    await supabase.from("teacher_availability").delete().eq("id", id);
    setSlots(prev => prev.filter(s => s.id !== id));
    toast({ title: "Slot removed" });
  };

  const grouped = DAYS.map((day, i) => ({
    day,
    dayIndex: i,
    slots: slots.filter(s => s.day_of_week === i),
  }));

  return (
    <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
      <h3 className="font-display text-lg font-bold text-foreground mb-6">Your Availability</h3>

      {/* Add new slot */}
      <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-muted/50 rounded-xl">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Day</label>
          <select
            value={newSlot.day_of_week}
            onChange={e => setNewSlot(p => ({ ...p, day_of_week: Number(e.target.value) }))}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          >
            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">From</label>
          <select
            value={newSlot.start_time}
            onChange={e => setNewSlot(p => ({ ...p, start_time: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          >
            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">To</label>
          <select
            value={newSlot.end_time}
            onChange={e => setNewSlot(p => ({ ...p, end_time: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          >
            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Button onClick={addSlot} disabled={loading} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Display slots by day */}
      <div className="space-y-3">
        {grouped.filter(g => g.slots.length > 0).map(g => (
          <div key={g.dayIndex} className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground w-24">{g.day}</span>
            <div className="flex flex-wrap gap-2">
              {g.slots.map(slot => (
                <Badge key={slot.id} variant="secondary" className="gap-1 pr-1">
                  {slot.start_time} – {slot.end_time}
                  <button onClick={() => slot.id && removeSlot(slot.id)} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
        {grouped.every(g => g.slots.length === 0) && (
          <p className="text-sm text-muted-foreground">No availability set. Add your available time slots above.</p>
        )}
      </div>
    </div>
  );
}
