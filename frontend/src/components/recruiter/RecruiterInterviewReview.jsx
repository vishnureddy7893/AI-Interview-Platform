import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCompanyInterview,
  listCompanyInterviews,
} from "@/services/interviewService";

function ScorePill({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">
        {value ?? "—"}
      </p>
    </div>
  );
}

export function RecruiterInterviewList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listCompanyInterviews();
        if (mounted) setInterviews(data.interviews || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load interviews"
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
      <div className="flex items-center gap-2 py-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading interviews…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">AI Interviews</h2>
      {interviews.length === 0 ? (
        <p className="text-slate-500">No AI interviews yet.</p>
      ) : (
        interviews.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer rounded-3xl border border-slate-200 shadow-sm transition hover:border-slate-400"
            onClick={() => navigate(`/recruiter/interviews/${item.id}`)}
          >
            <CardContent className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {item.candidate?.name || item.candidate?.email || "Candidate"}
                </p>
                <p className="text-sm text-slate-500">
                  {item.job?.title || "Job"} · {item.status}
                </p>
              </div>
              <div className="text-sm text-slate-600">
                Score {item.overallScore ?? "—"} ·{" "}
                {item.recommendation || "Pending"}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function RecruiterInterviewReview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCompanyInterview(interviewId);
        if (mounted) setPayload(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load interview"
        );
        navigate("/recruiter/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [interviewId, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading review…
      </div>
    );
  }

  if (!payload) return null;

  const { interview, candidate } = payload;
  const resume = candidate?.resumeSummary;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-8">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate("/recruiter/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Interview Review
            </h1>
            <p className="text-sm text-slate-500">
              Read-only candidate evaluation
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8">
        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>
              {candidate?.name || candidate?.email || "Candidate"}
            </CardTitle>
            <p className="text-sm text-slate-500">
              {interview.job?.title} · {interview.job?.companyName}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4">
            <ScorePill label="Overall" value={interview.overallScore} />
            <ScorePill label="Technical" value={interview.technicalScore} />
            <ScorePill
              label="Communication"
              value={interview.communicationScore}
            />
            <ScorePill
              label="Recommendation"
              value={interview.recommendation}
            />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Resume Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {resume ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-slate-800">Skills: </span>
                  {[
                    ...(resume.skills?.programmingLanguages || []),
                    ...(resume.skills?.frameworks || []),
                  ]
                    .slice(0, 12)
                    .join(", ") || "—"}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Projects: </span>
                  {(resume.projects || [])
                    .map((p) => p.title)
                    .filter(Boolean)
                    .slice(0, 5)
                    .join(", ") || "—"}
                </p>
              </div>
            ) : (
              <p>No parsed resume available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Overall Feedback</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            {interview.overallFeedback || "—"}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Question-by-question
          </h2>
          {(interview.generatedQuestions || []).map((q, index) => (
            <Card
              key={q.id}
              className="rounded-3xl border border-slate-200 shadow-sm"
            >
              <CardHeader>
                <CardTitle className="text-base">
                  Q{index + 1}. [{q.roundType}] Score {q.score ?? "—"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{q.question}</p>
                <p>
                  <span className="text-slate-400">Answer: </span>
                  {q.candidateAnswer || "—"}
                </p>
                <p>
                  <span className="text-slate-400">Feedback: </span>
                  {q.feedback || "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecruiterInterviewReview;
