import { AlertCircle, CheckCircle2, Loader2, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Status banner for the background resume analysis.
 *
 * Deliberately quiet: analysis is not something the candidate has to manage,
 * so this states what is happening in one line and stays out of the way. It
 * never blocks the surrounding form.
 */

const TONES = {
  processing: {
    icon: Loader2,
    iconClass: "animate-spin text-blue-600",
    wrapper: "border-blue-200 bg-blue-50",
    text: "text-blue-900",
  },
  completed: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    wrapper: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-900",
  },
  failed: {
    icon: AlertCircle,
    iconClass: "text-amber-600",
    wrapper: "border-amber-200 bg-amber-50",
    text: "text-amber-900",
  },
};

function toneFor(status) {
  if (status === "uploaded" || status === "processing") return TONES.processing;
  if (status === "completed") return TONES.completed;
  if (status === "failed") return TONES.failed;
  return null;
}

function ResumeAnalysisStatus({
  status,
  message,
  canRetry,
  onRetry,
  retrying = false,
  className = "",
}) {
  const tone = toneFor(status);
  if (!tone || !message) return null;

  const Icon = tone.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${tone.wrapper} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.iconClass}`} />
        <p className={`text-sm ${tone.text}`}>{message}</p>
      </div>

      {status === "failed" && canRetry ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={retrying}
          onClick={onRetry}
          className="shrink-0 self-start bg-white sm:self-auto"
        >
          {retrying ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RotateCw className="mr-2 h-3.5 w-3.5" />
          )}
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export default ResumeAnalysisStatus;
