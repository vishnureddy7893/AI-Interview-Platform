import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

function TestCard({ test, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/40">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/50"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{test.title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open ? (
        <div className="grid gap-2 border-t border-slate-700/80 px-3 py-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-slate-400">Input</p>
            <pre className="overflow-x-auto rounded-xl bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-200">
              {test.input}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Expected Output</p>
            <pre className="overflow-x-auto rounded-xl bg-slate-950 px-3 py-2 font-mono text-xs text-sky-200">
              {test.expectedOutput}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TestCasePanel({ tests = [], results = null }) {
  return (
    <div className="h-full min-h-0 space-y-3 overflow-y-auto bg-[#0f1419] px-4 py-3">
      {tests.length === 0 ? (
        <p className="text-sm text-slate-400">
          Sample test cases will appear here.
        </p>
      ) : (
        tests.map((test, idx) => (
          <TestCard key={test.id} test={test} defaultOpen={idx === 0} />
        ))
      )}

      {results ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/50 px-3 py-3 text-sm text-slate-300">
          {results}
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          Test results placeholder — will show pass/fail once execution is
          connected.
        </p>
      )}
    </div>
  );
}

export default TestCasePanel;
