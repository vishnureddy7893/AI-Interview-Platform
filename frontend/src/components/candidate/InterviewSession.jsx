import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock3, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  completeInterview,
  getInterview,
  nextQuestion,
  submitAnswer,
} from "@/services/interviewService";

function wordCount(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function EvaluationPanel({ evaluation }) {
  if (!evaluation) return null;

  return (
    <Card className="rounded-3xl border border-emerald-100 bg-emerald-50/40 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>AI Evaluation</span>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">
            Score {evaluation.score ?? "—"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        <p>{evaluation.feedback}</p>

        {evaluation.strengths?.length ? (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Strengths
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {evaluation.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {evaluation.weaknesses?.length ? (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Weaknesses
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {evaluation.weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {evaluation.improvements?.length ? (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Improvements
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {evaluation.improvements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InterviewSession() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef(Date.now());
  const submitLockRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getInterview(interviewId, { start: true });
        if (!mounted) return;

        if (data.interview?.status === "completed") {
          navigate(`/candidate/interview/summary/${interviewId}`, {
            replace: true,
          });
          return;
        }

        setInterview(data.interview);
        setCurrentQuestion(data.currentQuestion);
        setTotalQuestions(data.totalQuestions || 0);
        setEvaluation(data.evaluation || null);
        setAnswer(data.currentQuestion?.candidateAnswer || "");
        startedAtRef.current = Date.now();
        setElapsed(0);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load interview"
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

  useEffect(() => {
    if (evaluation) return undefined;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [evaluation, currentQuestion?.id]);

  const handleSubmit = async () => {
    if (submitLockRef.current || submitting) return;
    if (!currentQuestion) return;

    if (!answer.trim()) {
      toast.error("Answer cannot be empty");
      return;
    }

    try {
      submitLockRef.current = true;
      setSubmitting(true);
      const timeTaken = Math.floor(
        (Date.now() - startedAtRef.current) / 1000
      );
      const data = await submitAnswer(interviewId, {
        questionId: currentQuestion.id || currentQuestion.questionId,
        answer: answer.trim(),
        timeTaken,
      });
      setEvaluation(data.evaluation);
      setInterview((prev) =>
        prev
          ? {
              ...prev,
              generatedQuestions: prev.generatedQuestions?.map((q) =>
                q.id === currentQuestion.id
                  ? {
                      ...q,
                      ...data.evaluation,
                      candidateAnswer: answer.trim(),
                      status: "evaluated",
                    }
                  : q
              ),
            }
          : prev
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to evaluate answer"
      );
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const handleNext = async () => {
    try {
      setAdvancing(true);
      const data = await nextQuestion(interviewId);

      if (data.completed || !data.nextQuestion) {
        const completed = await completeInterview(interviewId);
        toast.success(completed.message || "Interview completed");
        navigate(`/candidate/interview/summary/${interviewId}`);
        return;
      }

      setCurrentQuestion(data.nextQuestion);
      setEvaluation(
        data.nextQuestion.status === "evaluated"
          ? {
              questionId: data.nextQuestion.id,
              score: data.nextQuestion.score,
              feedback: data.nextQuestion.feedback,
              strengths: data.nextQuestion.strengths,
              weaknesses: data.nextQuestion.weaknesses,
              improvements: data.nextQuestion.improvements,
            }
          : null
      );
      setAnswer(data.nextQuestion.candidateAnswer || "");
      setInterview((prev) =>
        prev
          ? {
              ...prev,
              currentQuestionIndex: data.currentQuestionIndex,
            }
          : prev
      );
      startedAtRef.current = Date.now();
      setElapsed(0);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load next question"
      );
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Opening interview…
      </div>
    );
  }

  if (!interview || !currentQuestion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
        <p className="text-slate-500">No questions available.</p>
        <Button
          className="rounded-xl"
          onClick={() => navigate("/candidate/dashboard")}
        >
          Back to dashboard
        </Button>
      </div>
    );
  }

  const index = interview.currentQuestionIndex || 0;
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const isLast = index >= totalQuestions - 1;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
          <div className="flex items-center gap-3">
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
              <h1 className="text-xl font-bold text-slate-900">
                {interview.job?.title ||
                  interview.metadata?.jobTitle ||
                  "Interview"}
              </h1>
              <p className="text-sm text-slate-500">
                Question {index + 1} of {totalQuestions}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <Clock3 className="h-3.5 w-3.5" />
              {minutes}:{seconds}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {currentQuestion.roundType}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-8">
        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-500">
              {currentQuestion.difficulty} · ~{currentQuestion.estimatedTime}{" "}
              min
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl leading-relaxed text-slate-900">
              {currentQuestion.question}
            </p>

            {currentQuestion.expectedSkills?.length ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Expected skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.expectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Textarea
                className="min-h-48 rounded-2xl text-base"
                placeholder="Type your answer here…"
                value={answer}
                disabled={Boolean(evaluation) || submitting}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{wordCount(answer)} words</span>
                {!evaluation ? (
                  <Button
                    type="button"
                    className="rounded-xl bg-black hover:bg-neutral-800"
                    disabled={submitting || !answer.trim()}
                    onClick={handleSubmit}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating…
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {submitting ? (
          <div className="flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white py-8 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            AI is evaluating your answer…
          </div>
        ) : null}

        <EvaluationPanel evaluation={evaluation} />

        {evaluation ? (
          <div className="flex justify-end">
            <Button
              type="button"
              className="rounded-xl bg-black hover:bg-neutral-800"
              disabled={advancing}
              onClick={handleNext}
            >
              {advancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait…
                </>
              ) : isLast ? (
                "Finish Interview"
              ) : (
                "Next Question"
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default InterviewSession;
