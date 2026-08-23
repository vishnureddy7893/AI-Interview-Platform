import { useNavigate } from "react-router-dom";

/** Minimal footer — navigation the visitor may still need, and nothing invented. */

const LINKS = [
  { label: "Candidate sign in", path: "/candidate/login" },
  { label: "Recruiter sign in", path: "/recruiter/login" },
  { label: "Company sign in", path: "/company/login" },
];

function SiteFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded bg-primary text-[10px] font-bold text-primary-foreground"
          >
            AI
          </span>
          <span className="text-sm font-medium text-foreground">
            AI Interview Platform
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Interview Platform
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
