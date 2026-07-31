import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getApplication,
  getMyApplications,
  startApplicationRound,
} from "@/services/applicationService";

const STATUS_STYLES = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ready: "border-sky-200 bg-sky-50 text-sky-800",
  locked: "border-slate-200 bg-slate-50 text-slate-500",
  failed: "border-red-200 bg-red-50 text-red-700",
  skipped: "border-slate-200 bg-slate-100 text-slate-500",
};

function Timeline({ timeline, onStart, startingId }) {
  return (
    <ol className="space-y-3">
      {timeline.map((round) => (
        <li
          key={round.id}
          className={`rounded-2xl border px-4 py-3 ${
            STATUS_STYLES[round.status] || STATUS_STYLES.locked
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                {round.order}. {round.title}
              </p>
              <p className="text-sm opacity-80">
                {round.type} · {round.status}
                {round.score != null ? ` · Score ${round.score}` : ""}
                {round.durationMinutes ? ` · ${round.durationMinutes} min` : ""}
              </p>
            </div>
            {round.canStart ? (
              <Button
                type="button"
                size="sm"
                className="rounded-xl bg-black hover:bg-neutral-800"
                disabled={startingId === round.id}
                onClick={() => onStart(round)}
              >
                {startingId === round.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Start
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Applications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tab, setTab] = useState("workflow");
  const [startingId, setStartingId] = useState(null);

  const loadList = async () => {
    const data = await getMyApplications();
    setApplications(data.applications || []);
    if (!selectedId && data.applications?.length) {
      setSelectedId(data.applications[0].id);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await loadList();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load applications"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setDetailLoading(true);
        const data = await getApplication(selectedId);
        if (mounted) setDetail(data.application);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load application"
        );
      } finally {
        if (mounted) setDetailLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedId]);

  const handleStart = async (round) => {
    if (!detail) return;
    try {
      setStartingId(round.id);
      const data = await startApplicationRound(detail.id, round.id);

      if (data.requiresResume) {
        toast.error(data.message || "Complete resume analysis first");
        return;
      }

      if (data.completed) {
        toast.success("Resume screening completed");
        setDetail(data.application);
        await loadList();
        return;
      }

      if (data.redirect) {
        navigate(data.redirect);
        return;
      }

      setDetail(data.application);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start round");
    } finally {
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading applications…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
        <p className="mt-1 text-slate-500">
          Track hiring progress across every role you applied to.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="rounded-3xl border border-dashed">
          <CardContent className="py-12 text-center text-slate-500">
            No applications yet. Browse Jobs and apply to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            {applications.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => setSelectedId(app.id)}
                className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                  selectedId === app.id
                    ? "border-slate-900 bg-white shadow-sm"
                    : "border-slate-200 bg-white/70 hover:border-slate-400"
                }`}
              >
                <p className="font-semibold text-slate-900">
                  {app.job?.title || "Role"}
                </p>
                <p className="text-sm text-slate-500">
                  {app.company?.companyName || app.job?.companyName}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {app.status}
                  {app.overallScore != null ? ` · ${app.overallScore}` : ""}
                </p>
              </button>
            ))}
          </div>

          <Card className="rounded-3xl border border-slate-200 shadow-sm">
            {detailLoading || !detail ? (
              <CardContent className="flex items-center gap-2 py-16 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading details…
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <CardTitle>{detail.job?.title}</CardTitle>
                  <p className="text-sm text-slate-500">
                    {detail.company?.companyName || detail.job?.companyName}
                    {detail.job?.location ? ` · ${detail.job.location}` : ""}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {["workflow", "job", "company", "eligibility"].map(
                      (key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setTab(key)}
                          className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                            tab === key
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {key === "workflow" ? "Hiring Workflow" : key}
                        </button>
                      )
                    )}
                  </div>

                  {tab === "workflow" ? (
                    <Timeline
                      timeline={detail.timeline || []}
                      onStart={handleStart}
                      startingId={startingId}
                    />
                  ) : null}

                  {tab === "job" ? (
                    <div className="space-y-3 text-sm text-slate-700">
                      <p>{detail.job?.description || "No description."}</p>
                      <p>
                        <span className="font-medium">Requirements: </span>
                        {detail.job?.requirements || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Skills: </span>
                        {(detail.job?.skills || []).join(", ") || "—"}
                      </p>
                    </div>
                  ) : null}

                  {tab === "company" ? (
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="font-medium">Company: </span>
                        {detail.company?.companyName || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Industry: </span>
                        {detail.company?.industry || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Location: </span>
                        {detail.company?.location || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Website: </span>
                        {detail.company?.website || "—"}
                      </p>
                    </div>
                  ) : null}

                  {tab === "eligibility" ? (
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>
                        Current status:{" "}
                        <span className="font-medium">{detail.status}</span>
                      </p>
                      <p>
                        Overall score:{" "}
                        <span className="font-medium">
                          {detail.overallScore ?? "—"}
                        </span>
                      </p>
                      <p>
                        Completed rounds: {detail.completedRounds?.length || 0}
                      </p>
                      <p>
                        Locked rounds: {detail.lockedRounds?.length || 0}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default Applications;
