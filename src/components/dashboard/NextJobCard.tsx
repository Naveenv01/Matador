import { Job } from "@/data/sampleJobs";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, ArrowRight } from "lucide-react";

interface NextJobCardProps {
  job: Job | undefined;
}

export function NextJobCard({ job }: NextJobCardProps) {
  if (!job || !job.nextRunAt) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Next Scheduled Job</span>
        </div>
        <p className="text-muted-foreground text-sm">No scheduled jobs</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-info/20 bg-info/5 p-6 animate-slide-up">
      <div className="flex items-center gap-2 text-info mb-4">
        <Clock className="h-5 w-5" />
        <span className="font-medium">Next Scheduled Job</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{job.name}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{job.queue}</span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-info">
            {formatDistanceToNow(job.nextRunAt, { addSuffix: false })}
          </span>
          <span className="text-muted-foreground text-sm">remaining</span>
        </div>
        
        <p className="text-xs text-muted-foreground font-mono">
          Scheduled for {format(job.nextRunAt, 'PPpp')}
        </p>
      </div>
    </div>
  );
}
