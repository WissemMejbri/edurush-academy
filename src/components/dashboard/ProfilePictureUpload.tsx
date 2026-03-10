import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  userId: string;
  currentUrl: string | null;
  fullName: string | null;
  onUploaded: (url: string | null) => void;
}

export function ProfilePictureUpload({ userId, currentUrl, fullName, onUploaded }: Props) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", userId);
    setPreview(url);
    onUploaded(url);
    toast({ title: "Profile picture updated!" });
    setUploading(false);
  };

  const handleRemove = async () => {
    setUploading(true);
    // List and remove files in user folder
    const { data: files } = await supabase.storage.from("avatars").list(userId);
    if (files?.length) {
      await supabase.storage.from("avatars").remove(files.map(f => `${userId}/${f.name}`));
    }
    await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", userId);
    setPreview(null);
    onUploaded(null);
    toast({ title: "Profile picture removed" });
    setUploading(false);
  };

  const initials = fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-6">
      <Avatar className="w-20 h-20 border-2 border-border">
        {preview ? <AvatarImage src={preview} alt="Profile" /> : null}
        <AvatarFallback className="text-lg font-bold bg-accent/10 text-accent">{initials}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-1">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          {preview ? "Change Photo" : "Upload Photo"}
        </Button>
        {preview && (
          <Button size="sm" variant="ghost" onClick={handleRemove} disabled={uploading} className="gap-1 text-destructive">
            <Trash2 className="w-4 h-4" /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}
