import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchQueues, fetchJobs, fetchStats } from "@/services/api";
import { JobStatus } from "@/data/sampleJobs";
import { StatCard } from "./StatCard";
import { JobTable } from "./JobTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Timer,
  Search,
  RefreshCw,
  Layers,
} from "lucide-react";

export function Dashboard() {
  const [selectedQueue, setSelectedQueue] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | null>(null);

  // Fetch queues from API
  const { data: queues = [], isLoading: queuesLoading } = useQuery({
    queryKey: ['queues'],
    queryFn: fetchQueues,
    refetchInterval: 5000,
  });

  // Fetch jobs from API with filters
  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['jobs', selectedQueue, statusFilter],
    queryFn: () => fetchJobs({
      queue: selectedQueue === "all" ? undefined : selectedQueue,
      status: statusFilter || undefined,
    }),
    refetchInterval: 5000,
  });

  // Fetch stats from API
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 5000,
  });

  const isLoading = queuesLoading || jobsLoading || statsLoading;

  // Filter jobs by search query (client-side)
  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs;

    const query = searchQuery.toLowerCase();
    return jobs.filter(
      (job) =>
        job.name.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query)
    );
  }, [jobs, searchQuery]);

  // Calculate total jobs across all queues
  const totalJobs = queues.reduce((sum, q) => {
    const counts = q.jobCounts;
    return sum + counts.completed + counts.failed + counts.active + counts.waiting + counts.delayed;
  }, 0);

  // Find next scheduled job (earliest delayed job)
  const nextScheduledJob = useMemo(() => {
    const delayedJobs = jobs
      .filter(job => job.status === 'delayed' && job.nextRunAt)
      .sort((a, b) => (a.nextRunAt?.getTime() || 0) - (b.nextRunAt?.getTime() || 0));

    return delayedJobs[0];
  }, [jobs]);

  const handleRefresh = async () => {
    await refetchJobs();
  };

  // Count for status filters
  const statusCounts = {
    completed: stats?.completed || 0,
    failed: stats?.failed || 0,
    active: stats?.active || 0,
    waiting: stats?.waiting || 0,
    delayed: stats?.delayed || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Title and Queue Selector */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-lg">
                  <img src="/logo.png" alt="Matador" className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Matador</h1>
                  <p className="text-sm text-slate-400">Job Queue Monitor</p>
                </div>
              </div>

              {/* Queue Selector Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-300">Queue:</label>
                <Select value={selectedQueue} onValueChange={setSelectedQueue}>
                  <SelectTrigger className="w-[200px] bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Queues ({queues.length})</SelectItem>
                    {queues.map((queue) => (
                      <SelectItem key={queue.name} value={queue.name}>
                        {queue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Center: Next Scheduled Job */}
            {nextScheduledJob && (
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Timer className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-xs text-blue-300 font-medium">Next Scheduled Job</div>
                  <div className="text-sm text-white font-semibold">
                    {nextScheduledJob.queue} • {nextScheduledJob.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {nextScheduledJob.nextRunAt && (
                      <>
                        {Math.floor((nextScheduledJob.nextRunAt.getTime() - Date.now()) / 1000 / 60)} minutes remaining
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Right: Refresh Button */}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-2 bg-slate-800/50 border-slate-700 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div onClick={() => setStatusFilter(statusFilter === 'completed' ? null : 'completed')} className="cursor-pointer">
            <StatCard
              title="Completed"
              value={statusCounts.completed}
              icon={CheckCircle2}
              variant="success"
            />
          </div>
          <div onClick={() => setStatusFilter(statusFilter === 'failed' ? null : 'failed')} className="cursor-pointer">
            <StatCard
              title="Failed"
              value={statusCounts.failed}
              icon={XCircle}
              variant="destructive"
            />
          </div>
          <div onClick={() => setStatusFilter(statusFilter === 'active' ? null : 'active')} className="cursor-pointer">
            <StatCard
              title="Active"
              value={statusCounts.active}
              icon={Loader2}
              variant="info"
            />
          </div>
          <div onClick={() => setStatusFilter(statusFilter === 'waiting' ? null : 'waiting')} className="cursor-pointer">
            <StatCard
              title="Waiting"
              value={statusCounts.waiting}
              icon={Clock}
              variant="warning"
            />
          </div>
          <div onClick={() => setStatusFilter(statusFilter === 'delayed' ? null : 'delayed')} className="cursor-pointer">
            <StatCard
              title="Delayed"
              value={statusCounts.delayed}
              icon={Timer}
              variant="default"
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search jobs by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Active Filter Badges */}
          <div className="flex items-center gap-2">
            {statusFilter && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStatusFilter(null)}
                className="gap-2 bg-slate-700 hover:bg-slate-600"
              >
                {statusFilter}
                <XCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Jobs Table - Full Width */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
          <JobTable jobs={filteredJobs} />
        </div>
      </div>
    </div>
  );
}
