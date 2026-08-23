import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

/** Closing call to action — one decision, two paths, nothing else on screen. */
function FinalCtaSection() {
  const navigate = useNavigate();

  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start hiring on evidence
          </h2>
          <p className="mt-3 text-base leading-relaxed opacity-80">
            Create an account and run your first screening in minutes.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/candidate/signup")}
          >
            Sign up as a candidate
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => navigate("/company/login")}
          >
            Company sign in
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
