import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCompanyApplication,
  listCompanyApplications,
} from "@/services/applicationService";
import { MalpracticeReportCard } from "@/components/recruiter/MalpracticeReport";

export function RecruiterApplicationsPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listCompanyApplications();
        if (mounted) setApplications(data.applications || []);
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading applications…
      </div>
    );
  }

  const inProgress = applications.filter(
    (a) => !["Completed", "Rejected", "Selected", "Hired"].includes(a.status)
  ).length;
  const completed = applications.filter((a) =>
    ["Completed", "Selected", "Hired"].includes(a.status)
  ).length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;
  const selected = applications.filter((a) =>
    ["Selected", "Hired", "Offer"].includes(a.status)
  ).length;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Applications</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="rounded-2xl">
          <CardContent className="py-4">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-2xl font-bold">{applications.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="py-4">
            <p className="text-xs text-slate-400">In Progress</p>
            <p className="text-2xl font-bold">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="py-4">
            <p className="text-xs text-slate-400">Completed</p>
            <p className="text-2xl font-bold">{completed}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="py-4">
            <p className="text-xs text-slate-400">Rejected / Selected</p>
            <p className="text-2xl font-bold">
              {rejected} / {selected}
            </p>
          </CardContent>
        </Card>
      </div>

      {applications.length === 0 ? (
        <p className="text-slate-500">No applications yet.</p>
      ) : (
        applications.map((app) => (
          <Card
            key={app.id}
            className="cursor-pointer rounded-3xl border border-slate-200 shadow-sm hover:border-slate-400"
            onClick={() => navigate(`/recruiter/applications/${app.id}`)}
          >
            <CardContent className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {app.candidate?.name || app.candidate?.email || "Candidate"}
                </p>
                <p className="text-sm text-slate-500">
                  {app.job?.title || "Job"} · {app.status}
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Score {app.overallScore ?? "—"} · Round{" "}
                {app.timeline?.find((r) => r.status === "ready")?.title || "—"}
                {app.malpracticeSummary?.riskLevel
                  ? ` · Risk ${app.malpracticeSummary.riskLevel}`
                  : ""}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export function RecruiterApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCompanyApplication(applicationId);
        if (mounted) setPayload(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load application"
        );
        navigate("/recruiter/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [applicationId, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!payload) return null;
  const { application, candidate } = payload;
  const codingRound = (application.timeline || []).find(
    (r) => r.type === "Coding" && r.assessmentId
  );
  const codingAssessmentId =
    application.malpracticeSummary?.assessmentId ||
    codingRound?.assessmentId ||
    null;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {candidate?.name || candidate?.email}
            </h1>
            <p className="text-sm text-slate-500">
              {application.job?.title} · {application.status}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate("/recruiter/dashboard")}
          >
            Back
          </Button>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="grid gap-3 py-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Overall Score</p>
              <p className="text-2xl font-bold">
                {application.overallScore ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Current Round</p>
              <p className="text-lg font-semibold">
                {application.timeline?.find((r) => r.status === "ready")
                  ?.title || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Progress</p>
              <p className="text-lg font-semibold">
                {application.completedRounds?.length || 0} /{" "}
                {application.timeline?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="space-y-3 py-6">
            <h2 className="text-lg font-semibold">Workflow Progress</h2>
            {(application.timeline || []).map((round) => (
              <div
                key={round.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {round.order}. {round.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    {round.type} · {round.status}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {round.score != null ? round.score : "—"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <MalpracticeReportCard assessmentId={codingAssessmentId} />
      </div>
    </div>
  );
}

export default RecruiterApplicationsPanel;
