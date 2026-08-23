import {
  Braces,
  ClipboardList,
  FileSearch,
  MessagesSquare,
  ShieldCheck,
  Workflow,
} from "lucide-react";

/**
 * Platform capabilities.
 *
 * Every entry maps to something the codebase actually does — resume parsing,
 * matching, Judge0-backed coding rounds, AI interviews, workflow builder,
 * malpractice detection. No invented capabilities, no invented numbers.
 */

const CAPABILITIES = [
  {
    icon: FileSearch,
    title: "Resume screening",
    description:
      "Uploaded resumes are parsed into structured skills, education, projects and experience — no manual data entry, and candidates aren't kept waiting while it runs.",
  },
  {
    icon: ClipboardList,
    title: "Candidate matching",
    description:
      "Extracted skills are compared against each role's requirements so recruiters open a ranked list instead of a folder of PDFs.",
  },
  {
    icon: Braces,
    title: "Coding assessments",
    description:
      "Timed problems in a real editor, executed against hidden test cases with automatic scoring on correctness and runtime.",
  },
  {
    icon: MessagesSquare,
    title: "AI technical interviews",
    description:
      "Questions generated from the candidate's own resume and the job description, then scored per answer on technical depth and communication.",
  },
  {
    icon: Workflow,
    title: "Configurable hiring workflows",
    description:
      "Build the round sequence per role — screening, coding, technical, HR — and set question counts, difficulty and duration for each.",
  },
  {
    icon: ShieldCheck,
    title: "Assessment integrity",
    description:
      "Tab switches and focus loss during assessments are recorded and surfaced in the recruiter's report alongside the candidate's answers.",
  },
];

function FeaturesSection() {
  return (
    <section id="platform" className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            What the platform does
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Each stage of hiring, handled end to end — with the evidence behind
            every decision kept alongside it.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="bg-background p-6">
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
