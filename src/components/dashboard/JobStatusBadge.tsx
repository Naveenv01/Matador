import { cn } from "@/lib/utils";
import { JobStatus } from "@/data/sampleJobs";
import { CheckCircle2, XCircle, Loader2, Clock, Timer } from "lucide-react";

interface JobStatusBadgeProps {
  status: JobStatus;
}

const statusConfig = {
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-success/10 text-success border-success/20',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  active: {
    label: 'Active',
    icon: Loader2,
    className: 'bg-info/10 text-info border-info/20',
  },
  waiting: {
    label: 'Waiting',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  delayed: {
    label: 'Delayed',
    icon: Timer,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className
      )}
    >
      <Icon className={cn("h-3 w-3", status === 'active' && "animate-spin")} />
      {config.label}
    </span>
  );
}
