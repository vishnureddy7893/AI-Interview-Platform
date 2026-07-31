import { Loader2, Play, RotateCcw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import LanguageSelector from "./LanguageSelector";
import { EDITOR_THEMES, FONT_SIZES } from "./codingDefaults";

function Toolbar({
  language,
  onLanguageChange,
  allowedLanguages,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  onReset,
  onRun,
  onSubmit,
  runDisabled = false,
  running = false,
  submitDisabled = true,
  submitting = false,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-[#0f1419] px-3 py-2">
      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
        allowedLabels={allowedLanguages}
      />

      <select
        value={theme}
        onChange={(e) => onThemeChange(e.target.value)}
        className="h-8 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100 outline-none focus:border-slate-500"
        aria-label="Theme"
      >
        {EDITOR_THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        value={fontSize}
        onChange={(e) => onFontSizeChange(Number(e.target.value))}
        className="h-8 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100 outline-none focus:border-slate-500"
        aria-label="Font size"
      >
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 rounded-lg border-slate-700 bg-transparent text-xs text-slate-200 hover:bg-slate-800"
        onClick={onReset}
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        Reset
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={runDisabled}
          title={runDisabled ? "Running…" : "Run code with Judge0"}
          className={`h-8 rounded-lg text-xs text-white ${
            runDisabled
              ? "bg-slate-700 opacity-60"
              : "bg-sky-600 hover:bg-sky-500"
          }`}
          onClick={onRun}
        >
          {running ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="mr-1.5 h-3.5 w-3.5" />
          )}
          {running ? "Running…" : "Run Code"}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={submitDisabled || submitting}
          title="Solution submission coming soon"
          className="h-8 rounded-lg bg-emerald-700 text-xs text-white opacity-60"
          onClick={onSubmit}
        >
          {submitting ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-3.5 w-3.5" />
          )}
          Submit Solution
        </Button>
      </div>
    </div>
  );
}

export default Toolbar;
