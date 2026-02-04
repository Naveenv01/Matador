import { useState } from "react";
import { Job } from "@/data/sampleJobs";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobDetailSheet } from "./JobDetailSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";

interface JobTableProps {
  jobs: Job[];
}

export function JobTable({ jobs }: JobTableProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Job ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Queue</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Progress</TableHead>
              <TableHead className="text-muted-foreground font-medium">Attempts</TableHead>
              <TableHead className="text-muted-foreground font-medium">Created</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                key={job.id}
                className="border-border cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => setSelectedJob(job)}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {job.id}
                </TableCell>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                    {job.queue}
                  </span>
                </TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={job.progress} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground font-mono w-10">
                      {job.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {job.attempts}/{job.maxAttempts}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <JobDetailSheet job={selectedJob} onClose={() => setSelectedJob(null)} />
    </>
  );
}
