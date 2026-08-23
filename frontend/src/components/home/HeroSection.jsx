import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

/**
 * Hero.
 *
 * Says what the product does in one sentence a recruiter would recognise, then
 * offers one primary path (candidates, the larger audience) and one secondary
 * path (employers). No gradient wash, no floating blur, no scale-on-hover —
 * the visual weight sits in the type hierarchy.
 *
 * The panel on the right is the real pipeline the platform runs, not a mock
 * screenshot of features that do not exist.
 */

const PIPELINE = [
  { step: "Apply", detail: "Resume parsed and matched to the role" },
  { step: "Screen", detail: "AI shortlists against the job requirements" },
  { step: "Assess", detail: "Coding round with automated evaluation" },
  { step: "Interview", detail: "Adaptive technical and behavioural rounds" },
  { step: "Decide", detail: "Structured report with scores and evidence" },
];

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            AI-powered recruitment
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Screen, assess and interview candidates in one place
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Resumes are parsed and matched to your roles automatically. Coding
            rounds and technical interviews run themselves, and every candidate
            arrives at your shortlist with a structured, evidence-backed report.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/candidate/signup")}>
              Create a candidate account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/company/login")}
            >
              I'm hiring
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/candidate/login")}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </button>
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            The hiring pipeline
          </p>

          <ol className="mt-5 space-y-0">
            {PIPELINE.map((item, index) => (
              <li key={item.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-background text-xs font-semibold text-foreground">
                    {index + 1}
                  </span>
                  {index < PIPELINE.length - 1 ? (
                    <span aria-hidden className="w-px flex-1 bg-border" />
                  ) : null}
                </div>

                <div className={index < PIPELINE.length - 1 ? "pb-6" : ""}>
                  <p className="text-sm font-medium text-foreground">
                    {item.step}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
