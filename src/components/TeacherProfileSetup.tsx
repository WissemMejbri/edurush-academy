import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";

interface Profile {
  full_name: string | null;
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
  avatar_url: string | null;
}

interface TeacherProfileSetupProps {
  userId: string;
  onProfileSaved?: () => void;
}

const SUBJECT_OPTIONS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "French", "Arabic", "Economics",
  "Business Studies", "Computer Science", "Psychology",
  "History", "Geography", "Art & Design"
];

export const TeacherProfileSetup = ({ userId, onProfileSaved }: TeacherProfileSetupProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    bio: "",
    subjects: [],
    hourly_rate: null,
    avatar_url: null,
  });
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (data) {
        setProfile({
          full_name: data.full_name,
          bio: data.bio,
          subjects: data.subjects || [],
          hourly_rate: data.hourly_rate,
          avatar_url: data.avatar_url,
        });
      }
    };
    fetchProfile();
  }, [userId]);

  const handleAddSubject = (subject: string) => {
    if (subject && !profile.subjects?.includes(subject)) {
      setProfile(prev => ({
        ...prev,
        subjects: [...(prev.subjects || []), subject]
      }));
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects?.filter(s => s !== subject) || []
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          subjects: profile.subjects,
          hourly_rate: profile.hourly_rate,
        })
        .eq("user_id", userId);

      if (error) throw error;
      
      toast({ title: "Profile saved successfully!" });
      onProfileSaved?.();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
      <h3 className="font-display text-lg font-bold text-foreground mb-6">
        Teacher Profile Setup
      </h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <Input
            value={profile.full_name || ""}
            onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Dr. John Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Bio / About You
          </label>
          <Textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell students about your teaching experience, qualifications, and approach..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Subjects You Teach
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.subjects?.map((subject) => (
              <Badge key={subject} variant="secondary" className="gap-1 pr-1">
                {subject}
                <button
                  onClick={() => handleRemoveSubject(subject)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
            >
              <option value="">Select a subject...</option>
              {SUBJECT_OPTIONS.filter(s => !profile.subjects?.includes(s)).map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddSubject(newSubject)}
              disabled={!newSubject}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Hourly Rate (USD)
          </label>
          <Input
            type="number"
            value={profile.hourly_rate || ""}
            onChange={(e) => setProfile(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || null }))}
            placeholder="45"
            min={0}
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
};
