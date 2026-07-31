import { useEffect, useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listInterviewJobs } from "@/services/interviewService";
import { applyToJob } from "@/services/applicationService";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await listInterviewJobs();
        if (mounted) setJobs(data.jobs || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load jobs"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);
      const data = await applyToJob(jobId);
      toast.success(data.message || "Applied successfully");
      window.dispatchEvent(
        new CustomEvent("candidate-navigate", { detail: "applications" })
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Jobs</h1>
        <p className="mt-2 text-gray-500">
          Browse open roles and apply. Track progress under Applications.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-slate-300">
          <CardContent className="py-12 text-center text-slate-500">
            No open jobs with a hiring workflow yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="rounded-3xl border border-slate-200 shadow-sm"
            >
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-5 w-5 text-slate-700" />
                    {job.title}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    {job.companyName}
                    {job.location ? ` · ${job.location}` : ""}
                    {job.experience ? ` · ${job.experience}` : ""}
                  </p>
                </div>
                <Button
                  className="rounded-xl bg-black hover:bg-neutral-800"
                  disabled={applyingId === job.id}
                  onClick={() => handleApply(job.id)}
                >
                  {applyingId === job.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Apply
                </Button>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                {job.roundCount} interview round
                {job.roundCount === 1 ? "" : "s"} configured
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
