import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

/**
 * The two sides of the product, side by side.
 *
 * Candidates and recruiters want different things from the same system, and
 * saying so plainly is more useful than a wall of identical feature cards.
 */

const CANDIDATE_POINTS = [
  "Upload your resume once — it fills in your profile for you",
  "See exactly where each application stands",
  "Practice-grade technical and coding rounds, available any time",
  "Feedback after every interview, not just a rejection",
];

const EMPLOYER_POINTS = [
  "A ranked shortlist instead of an inbox of PDFs",
  "Consistent, structured evaluation for every applicant",
  "Coding and interview rounds that run without scheduling",
  "Reports that show the reasoning behind each score",
];

function Column({ id, eyebrow, title, body, points, action }) {
  return (
    <div id={id} className="scroll-mt-20 rounded-lg border border-border p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>

      <ul className="mt-6 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex gap-3 text-sm text-foreground">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-success"
              aria-hidden
            />
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-7">{action}</div>
    </div>
  );
}

function AudienceSection() {
  const navigate = useNavigate();

  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <Column
            id="candidates"
            eyebrow="For candidates"
            title="A clearer path than the black hole"
            body="Most applications disappear without a word. Here you can see what stage you're at, what was assessed, and what to work on next."
            points={CANDIDATE_POINTS}
            action={
              <Button onClick={() => navigate("/candidate/signup")}>
                Create your profile
              </Button>
            }
          />

          <Column
            id="employers"
            eyebrow="For recruiters and hiring teams"
            title="Evaluate every applicant the same way"
            body="Screening, assessment and interviewing run on one workflow, so the shortlist you review is comparable candidate to candidate."
            points={EMPLOYER_POINTS}
            action={
              <Button variant="outline" onClick={() => navigate("/company/login")}>
                Company sign in
              </Button>
            }
          />
        </div>
      </div>
    </section>
  );
}

export default AudienceSection;
