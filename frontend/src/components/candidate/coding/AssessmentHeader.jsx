import { Maximize2, Minimize2, ShieldCheck, ShieldAlert, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";

function formatTime(totalSeconds) {
  const s = Math.max(0, Number(totalSeconds) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function AssessmentHeader({
  companyName,
  companyLogo,
  jobTitle,
  roundTitle,
  questionNumber,
  totalQuestions,
  remainingSeconds,
  warningCount = 0,
  warningLimit = 3,
  isFullscreen = false,
  onToggleFullscreen,
  onExit,
}) {
  const lowTime = remainingSeconds <= 5 * 60;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-800 bg-[#0f1419] px-3 text-slate-100 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800 text-sm font-bold text-white">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            (companyName || "C").charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {companyName}
          </p>
          <p className="truncate text-xs text-slate-400">
            {jobTitle} · {roundTitle}
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300">
          Q {questionNumber}/{totalQuestions}
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold tabular-nums ${
            lowTime
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-slate-700 bg-slate-900/80 text-slate-100"
          }`}
        >
          <Clock3 className="h-3.5 w-3.5" />
          {formatTime(remainingSeconds)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-300 sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          Integrity
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-200">
          <ShieldAlert className="h-3.5 w-3.5" />
          {warningCount}/{warningLimit}
        </div>
        <div className="hidden rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 lg:block">
          {isFullscreen ? "Fullscreen" : "Windowed"}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="hidden h-8 rounded-lg border-slate-700 bg-transparent px-3 text-xs text-slate-200 hover:bg-slate-800 sm:inline-flex"
          onClick={onExit}
        >
          Exit
        </Button>
      </div>
    </header>
  );
}

export default AssessmentHeader;
