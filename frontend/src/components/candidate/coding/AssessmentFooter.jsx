import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * AssessmentFooter — bottom chrome with tabs + finish action.
 * Used by CodingAssessmentLayout (also inlined as BottomPanel for cohesion).
 */
function AssessmentFooter({
  activeTab,
  onTabChange,
  onFinish,
  finishing = false,
  children,
}) {
  const tabs = [
    { id: "console", label: "Console" },
    { id: "tests", label: "Sample Test Cases" },
    { id: "results", label: "Test Results" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-slate-800 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`rounded-t-lg px-3 py-2 text-xs font-medium transition ${
              activeTab === tab.id
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto px-2 py-1.5">
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-lg bg-white text-xs text-slate-900 hover:bg-slate-200"
            disabled={finishing}
            onClick={onFinish}
          >
            {finishing ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : null}
            Finish Assessment
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

export default AssessmentFooter;
