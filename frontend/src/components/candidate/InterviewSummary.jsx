import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { completeInterview, getInterview } from "@/services/interviewService";

function ScoreBar({ label, value }) {
  const score = Number(value) || 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  if (!Number.isFinite(Number(seconds))) return "—";
  const total = Number(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s}s`;
}

function InterviewSummary() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        let data = await getInterview(interviewId);

        if (data.interview?.status !== "completed") {
          const completed = await completeInterview(interviewId);
          data = {
            interview: completed.interview,
            report: completed.report,
          };
        } else {
          data = {
            interview: data.interview,
            report: {
              overallScore: data.interview.overallScore,
              technicalScore: data.interview.technicalScore,
              communicationScore: data.interview.communicationScore,
              problemSolvingScore: data.interview.problemSolvingScore,
              projectKnowledgeScore: data.interview.projectKnowledgeScore,
              confidenceScore: data.interview.confidenceScore,
              roundScores: data.interview.roundScores,
              strengths: data.interview.strengths,
              weaknesses: data.interview.weaknesses,
              improvements: data.interview.improvements,
              overallFeedback: data.interview.overallFeedback,
              recommendation: data.interview.recommendation,
              completedAt: data.interview.completedAt,
              durationSeconds: data.interview.metadata?.durationSeconds,
              questionsAnswered: data.interview.metadata?.answeredCount,
            },
          };
        }

        if (!mounted) return;
        setInterview(data.interview);
        setReport(data.report);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load summary"
        );
        navigate("/candidate/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [interviewId, navigate]);

  const roundEntries = useMemo(
    () => Object.entries(report?.roundScores || {}),
    [report]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading summary…
      </div>
    );
  }

  if (!interview || !report) return null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-8">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate("/candidate/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Interview Summary
            </h1>
            <p className="text-sm text-slate-500">
              {interview.job?.title || interview.metadata?.jobTitle}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-8 lg:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200 shadow-sm lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-10">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Overall Score
            </p>
            <p className="text-5xl font-bold text-slate-900">
              {report.overallScore ?? "—"}
            </p>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">
              {report.recommendation || "—"}
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBar label="Technical" value={report.technicalScore} />
            <ScoreBar label="Communication" value={report.communicationScore} />
            <ScoreBar
              label="Problem Solving"
              value={report.problemSolvingScore}
            />
            <ScoreBar
              label="Project Knowledge"
              value={report.projectKnowledgeScore}
            />
            <ScoreBar label="Confidence" value={report.confidenceScore} />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Round Scores</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {roundEntries.length ? (
              roundEntries.map(([round, score]) => (
                <ScoreBar key={round} label={round} value={score} />
              ))
            ) : (
              <p className="text-sm text-slate-400">No round scores available</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Overall Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>{report.overallFeedback || "—"}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                  Strengths
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {(report.strengths || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                  Weaknesses
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {(report.weaknesses || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                  Areas to Improve
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {(report.improvements || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 shadow-sm lg:col-span-3">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-slate-400">Duration</p>
              <p className="mt-1 font-medium">
                {formatDuration(report.durationSeconds)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">
                Questions Answered
              </p>
              <p className="mt-1 font-medium">
                {report.questionsAnswered ??
                  interview.generatedQuestions?.length ??
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Completed</p>
              <p className="mt-1 font-medium">
                {report.completedAt
                  ? new Date(report.completedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InterviewSummary;
