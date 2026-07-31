import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generateInterview,
  getInterviewPreview,
} from "@/services/interviewService";

function InterviewStart() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getInterviewPreview(jobId);
        if (mounted) setPreview(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load interview preview"
        );
        navigate("/candidate/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [jobId, navigate]);

  const handleStart = async () => {
    try {
      setStarting(true);
      const data = await generateInterview(jobId);
      toast.success(data.message || "Interview ready");
      navigate(`/candidate/interview/session/${data.interviewId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate interview"
      );
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading interview…
      </div>
    );
  }

  if (!preview) return null;

  const { job, workflow, estimatedDurationMinutes, instructions } = preview;

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
              Start AI Interview
            </h1>
            <p className="text-sm text-slate-500">
              Personalized questions from your resume and this role
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8">
        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <p className="text-sm text-slate-500">
              {job.companyName}
              {job.department ? ` · ${job.department}` : ""}
              {job.location ? ` · ${job.location}` : ""}
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Experience
              </p>
              <p className="mt-1 font-medium text-slate-800">
                {job.experience || "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                Estimated duration
              </p>
              <p className="mt-1 font-medium text-slate-800">
                {estimatedDurationMinutes} min
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Rounds
              </p>
              <p className="mt-1 font-medium text-slate-800">
                {workflow.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Interview Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {workflow.map((round) => (
                <li
                  key={round.id || round.order}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
                        {round.order}
                      </span>
                      {round.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {round.type}
                      {round.difficulty ? ` · ${round.difficulty}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{round.questionCount} questions</p>
                    {round.duration ? <p>{round.duration} min</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-slate-700" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
              {instructions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="button"
            disabled={starting}
            className="rounded-xl bg-black px-6 hover:bg-neutral-800"
            onClick={handleStart}
          >
            {starting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating interview…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Interview
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InterviewStart;
