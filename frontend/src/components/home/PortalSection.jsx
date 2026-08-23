import { ArrowRight, Building2, UserRound, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Portal chooser.
 *
 * The platform genuinely has three sign-in surfaces with different permissions,
 * so this is real navigation rather than decoration. Each card is one link with
 * a plain description of who it's for — no colour-coding by role, which only
 * added noise.
 */

const PORTALS = [
  {
    icon: UserRound,
    title: "Candidate",
    description:
      "Build your profile, apply to roles, and take assessments and interviews.",
    action: "Candidate sign in",
    path: "/candidate/login",
  },
  {
    icon: Users,
    title: "Recruiter",
    description:
      "Post jobs, review applicants, run interview rounds and read reports.",
    action: "Recruiter sign in",
    path: "/recruiter/login",
  },
  {
    icon: Building2,
    title: "Company admin",
    description:
      "Manage your organisation, invite recruiters and oversee hiring activity.",
    action: "Company sign in",
    path: "/company/login",
  },
];

function PortalSection() {
  const navigate = useNavigate();

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Sign in to your workspace
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Three roles, one platform. Pick the one that matches your account.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PORTALS.map(({ icon: Icon, title, description, action, path }) => (
            <button
              key={title}
              type="button"
              onClick={() => navigate(path)}
              className="group flex flex-col rounded-lg border border-border bg-background p-6 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />

              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>

              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                {action}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PortalSection;
