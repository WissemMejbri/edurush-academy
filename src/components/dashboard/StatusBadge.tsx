import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  accepted: { label: "Approved", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  scheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  completed: { label: "Completed", className: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
  declined: { label: "Declined", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={cn("text-xs font-medium px-3 py-1 rounded-full border", config.className)}>
      {config.label}
    </span>
  );
}
