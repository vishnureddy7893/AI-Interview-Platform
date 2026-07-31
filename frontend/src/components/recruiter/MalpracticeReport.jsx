import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { getMalpracticeReport } from "@/services/assessmentService";

const RISK_STYLES = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Medium: "border-amber-200 bg-amber-50 text-amber-800",
  High: "border-red-200 bg-red-50 text-red-800",
};

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 px-3 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function MalpracticeReportPanel({ assessmentId }) {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    if (!assessmentId) {
      setLoading(false);
      setPayload(null);
      return undefined;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getMalpracticeReport(assessmentId);
        if (mounted) setPayload(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load malpractice report"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [assessmentId]);

  if (!assessmentId) {
    return (
      <p className="text-sm text-slate-500">
        No coding assessment linked yet.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading malpractice report…
      </div>
    );
  }

  if (!payload?.malpracticeReport) return null;

  const report = payload.malpracticeReport;
  const summary = report.summary || {};
  const riskClass = RISK_STYLES[report.riskLevel] || RISK_STYLES.Low;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-sm font-semibold ${riskClass}`}
        >
          Risk: {report.riskLevel} ({report.riskScore})
        </span>
        <span className="text-sm text-slate-600">
          Warnings: {report.warningCount}
        </span>
        {report.autoSubmitted ? (
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
            Auto-submitted
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Tab Switches" value={summary.tabSwitches || 0} />
        <Stat label="Fullscreen Exits" value={summary.fullscreenExits || 0} />
        <Stat label="Copy Attempts" value={summary.copyAttempts || 0} />
        <Stat label="Paste Attempts" value={summary.pasteAttempts || 0} />
        <Stat label="DevTools Attempts" value={summary.devtoolsAttempts || 0} />
        <Stat label="Idle Events" value={summary.idleEvents || 0} />
        <Stat label="Right Clicks" value={summary.rightClickAttempts || 0} />
        <Stat label="Window Blurs" value={summary.windowBlurs || 0} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          Event Timeline
        </h3>
        {(report.events || []).length === 0 ? (
          <p className="text-sm text-slate-500">No malpractice events recorded.</p>
        ) : (
          <ol className="max-h-72 space-y-2 overflow-y-auto">
            {[...report.events].reverse().map((event, index) => (
              <li
                key={`${event.type}-${event.timestamp}-${index}`}
                className="rounded-2xl border border-slate-100 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{event.type}</span>
                  <span className="text-xs text-slate-400">
                    {event.timestamp
                      ? new Date(event.timestamp).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <p className="text-slate-600">{event.label}</p>
                {event.warningNumber != null ? (
                  <p className="text-xs text-amber-700">
                    Warning #{event.warningNumber}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export function MalpracticeReportCard({ assessmentId, title = "Malpractice Report" }) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="space-y-3 py-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <MalpracticeReportPanel assessmentId={assessmentId} />
      </CardContent>
    </Card>
  );
}

export default MalpracticeReportPanel;
