import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CodingAssessmentLayout from "@/components/candidate/coding/CodingAssessmentLayout";
import {
  completeApplicationRound,
  getApplication,
} from "@/services/applicationService";
import { getAssessment } from "@/services/assessmentService";

const COPY = {
  aptitude: {
    title: "Aptitude Assessment",
    body: "MCQ aptitude module placeholder. Complete to advance your hiring workflow.",
  },
  communication: {
    title: "Communication Assessment",
    body: "Communication assessment module placeholder. Complete to advance.",
  },
};

function SoftAssessmentPlaceholder({ module, onBack, onComplete, submitting }) {
  const meta = COPY[module] || {
    title: "Assessment",
    body: "Assessment module placeholder.",
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-8">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{meta.title}</h1>
            <p className="text-sm text-slate-500">Application round</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>{meta.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-600">{meta.body}</p>
            <Button
              className="rounded-xl bg-black hover:bg-neutral-800"
              disabled={submitting}
              onClick={onComplete}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Complete Round
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AssessmentRoundPage() {
  const { module, applicationId, roundId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [round, setRound] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [settings, setSettings] = useState({});
  const finishLock = useRef(false);

  const goDashboard = useCallback(() => {
    navigate("/candidate/dashboard", {
      state: { activePage: "applications" },
    });
  }, [navigate]);

  const handleFinish = useCallback(
    async ({ auto = false } = {}) => {
      if (finishLock.current) return;
      finishLock.current = true;
      try {
        setSubmitting(true);
        await completeApplicationRound(
          applicationId,
          roundId,
          auto ? 0 : 75
        );
        toast.success(
          auto
            ? "Assessment auto-submitted due to warning limit"
            : "Assessment finished"
        );
        goDashboard();
      } catch (error) {
        finishLock.current = false;
        toast.error(
          error.response?.data?.message || "Failed to complete round"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [applicationId, roundId, goDashboard]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const appData = await getApplication(applicationId);
        if (!mounted) return;

        const app = appData.application;
        const found = (app?.timeline || []).find((r) => r.id === roundId);
        setApplication(app);
        setRound(found || null);

        if (module !== "coding") {
          setSettings(found?.settings || {});
          return;
        }

        let id = found?.assessmentId;
        if (!id) {
          toast.error(
            "Assessment not found. Start the round from Applications."
          );
          return;
        }
        id = typeof id === "object" ? id._id || id.id : id;
        const assessmentData = await getAssessment(id);
        if (!mounted) return;
        setAssessmentId(assessmentData.assessment.id);
        setSettings({
          ...(found?.settings || {}),
          ...(assessmentData.settings || {}),
        });
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load assessment"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [module, applicationId, roundId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Preparing assessment…
      </div>
    );
  }

  if (module === "coding") {
    if (!assessmentId) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 text-slate-600">
          <p>Coding assessment is not ready.</p>
          <Button className="rounded-xl" onClick={goDashboard}>
            Back to Applications
          </Button>
        </div>
      );
    }

    return (
      <CodingAssessmentLayout
        application={application}
        round={round}
        assessmentId={assessmentId}
        settings={settings}
        submitting={submitting}
        onFinish={handleFinish}
        onExit={goDashboard}
      />
    );
  }

  return (
    <SoftAssessmentPlaceholder
      module={module}
      onBack={goDashboard}
      onComplete={() => handleFinish({ auto: false })}
      submitting={submitting}
    />
  );
}

export default AssessmentRoundPage;
