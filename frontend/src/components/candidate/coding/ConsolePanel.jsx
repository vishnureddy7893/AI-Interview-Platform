function ConsolePanel({
  status = "idle",
  stdout = "",
  stderr = "",
  compileOutput = "",
  executionTime = null,
  memoryUsage = null,
  running = false,
}) {
  const isCompileError = status === "Compilation Error";
  const isRuntimeError =
    status === "Runtime Error" || status === "Time Limit Exceeded";
  const hasProgramOutput = Boolean(stdout);
  const showPlaceholder = status === "idle" && !running;

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#0f1419] px-4 py-3 text-sm text-slate-300">
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-400">
          Status: {running ? "Running…" : status}
        </span>
        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-400">
          Execution Time:{" "}
          {executionTime != null ? `${executionTime} ms` : "—"}
        </span>
        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-400">
          Memory Used: {memoryUsage != null ? `${memoryUsage} KB` : "—"}
        </span>
      </div>

      {running ? (
        <p className="text-sm text-slate-400">Executing on Judge0…</p>
      ) : null}

      {showPlaceholder ? (
        <p className="text-sm text-slate-500">
          Click Run Code to compile and execute. Output will appear here.
        </p>
      ) : null}

      {!running && isCompileError ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-400">
            Compile Error
          </p>
          <pre className="min-h-[72px] whitespace-pre-wrap rounded-2xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 font-mono text-xs text-rose-200">
            {compileOutput || stderr || "Compilation failed."}
          </pre>
        </div>
      ) : null}

      {!running && isRuntimeError ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
            Runtime Error
          </p>
          <pre className="min-h-[72px] whitespace-pre-wrap rounded-2xl border border-amber-500/30 bg-amber-950/20 px-3 py-2 font-mono text-xs text-amber-100">
            {stderr || compileOutput || status}
          </pre>
          {hasProgramOutput ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Program Output
              </p>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-emerald-200/80">
                {stdout}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}

      {!running && !isCompileError && !isRuntimeError && status !== "idle" ? (
        <div className="space-y-3">
          {compileOutput ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Compilation Output
              </p>
              <pre className="min-h-[40px] whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-400">
                {compileOutput}
              </pre>
            </div>
          ) : null}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Program Output
            </p>
            <pre className="min-h-[72px] whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-emerald-200/80">
              {stdout || "(no output)"}
            </pre>
          </div>
          {stderr ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stderr
              </p>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-amber-100/80">
                {stderr}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ConsolePanel;
