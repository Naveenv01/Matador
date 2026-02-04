import { Queue } from "@/data/sampleJobs";
import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";

interface QueueListProps {
  queues: Queue[];
  selectedQueue: string | null;
  onSelectQueue: (queue: string | null) => void;
}

export function QueueList({ queues, selectedQueue, onSelectQueue }: QueueListProps) {
  const totalJobs = queues.reduce(
    (acc, q) => acc + Object.values(q.jobCounts).reduce((a, b) => a + b, 0),
    0
  );

  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelectQueue(null)}
        className={cn(
          "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          selectedQueue === null
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span>All Queues</span>
        <span className="font-mono text-xs">{totalJobs.toLocaleString()}</span>
      </button>

      {queues.map((queue) => {
        const jobCount = Object.values(queue.jobCounts).reduce((a, b) => a + b, 0);
        const isSelected = selectedQueue === queue.name;

        return (
          <button
            key={queue.name}
            onClick={() => onSelectQueue(queue.name)}
            className={cn(
              "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors group",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              {queue.isPaused ? (
                <Pause className="h-3.5 w-3.5 text-warning" />
              ) : (
                <Play className="h-3.5 w-3.5 text-success" />
              )}
              <span className="font-medium truncate">{queue.name}</span>
            </div>
            <span className="font-mono text-xs">{jobCount.toLocaleString()}</span>
          </button>
        );
      })}
    </div>
  );
}
