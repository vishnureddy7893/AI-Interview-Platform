/**
 * How hiring runs on the platform, from the employer's side.
 *
 * Four numbered steps, plain language, no illustrations for their own sake.
 */

const STEPS = [
  {
    title: "Post the role",
    body: "Describe the job and its required skills, then choose which rounds candidates go through — screening only, or coding and interviews too.",
  },
  {
    title: "Candidates apply",
    body: "Applicants upload a resume once. It's parsed in the background and matched against the role while they finish their profile.",
  },
  {
    title: "The platform assesses",
    body: "Shortlisted candidates take the rounds you configured. Coding submissions are executed and scored; interview answers are evaluated question by question.",
  },
  {
    title: "You review evidence",
    body: "Every candidate arrives with scores, strengths, gaps and the answers behind them — so the hiring conversation starts from facts.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            How the hiring process works
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            From posting a role to a decision you can defend.
          </p>
        </div>

        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <div className="flex items-baseline gap-3 border-t-2 border-primary pt-4">
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorksSection;
