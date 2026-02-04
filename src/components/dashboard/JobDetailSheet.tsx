import { Job } from "@/data/sampleJobs";
import { JobStatusBadge } from "./JobStatusBadge";
import { JsonViewer } from "./JsonViewer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { AlertTriangle, Clock, Database, Hash, Layers, RefreshCw, Timer } from "lucide-react";

interface JobDetailSheetProps {
  job: Job | null;
  onClose: () => void;
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-md bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export function JobDetailSheet({ job, onClose }: JobDetailSheetProps) {
  if (!job) return null;

  return (
    <Sheet open={!!job} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl">{job.name}</SheetTitle>
            <JobStatusBadge status={job.status} />
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono font-medium">{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-3" />
          </div>

          <Separator className="bg-border" />

          {/* Details Grid */}
          <div className="grid gap-4">
            <DetailRow icon={Hash} label="Job ID" value={<span className="font-mono">{job.id}</span>} />
            <DetailRow icon={Layers} label="Queue" value={job.queue} />
            <DetailRow icon={RefreshCw} label="Attempts" value={`${job.attempts} / ${job.maxAttempts}`} />
            <DetailRow icon={Clock} label="Created" value={format(job.createdAt, 'PPpp')} />
            
            {job.processedAt && (
              <DetailRow icon={Timer} label="Started Processing" value={format(job.processedAt, 'PPpp')} />
            )}
            
            {job.finishedAt && (
              <DetailRow icon={Timer} label="Finished" value={format(job.finishedAt, 'PPpp')} />
            )}

            {job.nextRunAt && (
              <DetailRow icon={Timer} label="Next Run" value={format(job.nextRunAt, 'PPpp')} />
            )}

            {job.duration !== undefined && (
              <DetailRow icon={Timer} label="Duration" value={`${(job.duration / 1000).toFixed(2)}s`} />
            )}
          </div>

          {/* Error Message */}
          {job.failedReason && (
            <>
              <Separator className="bg-border" />
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium text-sm">Error</span>
                </div>
                <p className="text-sm font-mono text-destructive/90 break-all">
                  {job.failedReason}
                </p>
              </div>
            </>
          )}

          {/* Job Data */}
          <Separator className="bg-border" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Job Data</span>
            </div>
            <JsonViewer data={job.data} initialExpanded={true} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
