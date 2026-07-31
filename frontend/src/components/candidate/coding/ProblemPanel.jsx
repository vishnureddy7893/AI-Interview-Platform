import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const DIFFICULTY_STYLES = {
  Easy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Hard: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  Mixed: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-slate-200">{children}</div>
    </section>
  );
}

function ExampleCard({ example, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/50">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/60"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{example.title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open ? (
        <div className="space-y-2 border-t border-slate-700/80 px-3 py-3 text-sm">
          <div>
            <p className="mb-1 text-xs text-slate-400">Input</p>
            <pre className="overflow-x-auto rounded-xl bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-200">
              {example.input}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Output</p>
            <pre className="overflow-x-auto rounded-xl bg-slate-950 px-3 py-2 font-mono text-xs text-sky-200">
              {example.output}
            </pre>
          </div>
          {example.explanation ? (
            <p className="text-slate-300">
              <span className="font-medium text-slate-100">Explanation: </span>
              {example.explanation}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ProblemPanel({ problem }) {
  if (!problem) return null;

  const difficultyClass =
    DIFFICULTY_STYLES[problem.difficulty] || DIFFICULTY_STYLES.Medium;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#12171e]">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs text-slate-400">
              Problem {problem.questionNumber}
            </p>
            <h2 className="text-lg font-semibold text-white">{problem.title}</h2>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyClass}`}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(problem.topics || []).map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <Section title="Description">
          <p className="whitespace-pre-wrap">{problem.description}</p>
        </Section>

        <Section title="Constraints">
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            {(problem.constraints || []).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Section>

        <Section title="Input Format">
          <p>{problem.inputFormat}</p>
        </Section>

        <Section title="Output Format">
          <p>{problem.outputFormat}</p>
        </Section>

        <Section title="Examples">
          <div className="space-y-2">
            {(problem.examples || []).map((example, idx) => (
              <ExampleCard
                key={example.id}
                example={example}
                defaultOpen={idx === 0}
              />
            ))}
          </div>
        </Section>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 px-3 py-3">
            <p className="text-xs text-slate-400">Time Limit</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {problem.timeLimitMinutes} min
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 px-3 py-3">
            <p className="text-xs text-slate-400">Memory Limit</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {problem.memoryLimitMb} MB
            </p>
          </div>
        </div>

        <Section title="Recruiter Instructions">
          <p className="rounded-2xl border border-slate-700/80 bg-slate-900/40 px-3 py-3 text-slate-300">
            {problem.recruiterInstructions}
          </p>
        </Section>
      </div>
    </div>
  );
}

export default ProblemPanel;
