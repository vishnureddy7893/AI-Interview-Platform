import { Sparkles, AlertCircle, ChevronDown, Eye, Settings } from "lucide-react";

const statusIndicatorStyle = {
  completed: "bg-green-500 text-white",
  current: "bg-blue-500 text-white",
  upcoming: "bg-gray-200 text-gray-500",
};

const statusBarStyle = {
  completed: "bg-green-500",
  current: "bg-blue-400",
  upcoming: "bg-gray-200",
};

const statusBadgeStyle = {
  completed: "bg-green-50 text-green-700 border-green-200",
  current: "bg-blue-50 text-blue-700 border-blue-200",
  upcoming: "bg-gray-50 text-gray-500 border-gray-200",
};

function HiringPipelineCard({
  variant = "recruiter",
  jobTitle,
  assignedRecruiter,
  department,
  totalApplications,
  currentStage,
  overallProgress,
  stages = [],
  aiInsight,
  actionRequired,
  onViewPipeline,
  onManageJob,
}) {
  const isCompany = variant === "company";

  const currentStageBadge = statusBadgeStyle[currentStage] || statusBadgeStyle.upcoming;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg">

      {/* ============ HEADER ============ */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900 truncate">{jobTitle}</h3>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0 ${currentStageBadge}`}>
              {currentStage}
            </span>
          </div>
          {isCompany ? (
            <p className="text-sm text-gray-500">
              Assigned to <span className="font-medium text-gray-700">{assignedRecruiter}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{department}</span> Department
            </p>
          )}
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
          <p className="text-xs text-gray-500">Applications</p>
        </div>
      </div>

      {/* ============ OVERALL PROGRESS ============ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-500">Overall Progress</span>
          <span className="text-xs font-semibold text-gray-700">{overallProgress}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* ============ STAGE PIPELINE ============ */}
      <div className="space-y-0">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          const isCurrent = stage.status === "current";

          return (
            <div key={stage.id}>
              <div className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                isCurrent ? "bg-blue-50/50 ring-1 ring-blue-200" : "hover:bg-gray-50/50"
              }`}>
                {/* Stage Indicator Dot */}
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shrink-0 transition-colors ${statusIndicatorStyle[stage.status] || statusIndicatorStyle.upcoming}`}>
                  {stage.name.charAt(0)}
                </div>

                {/* Stage Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isCurrent ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                    }`}>
                      {stage.name}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">{stage.percentage}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${statusBarStyle[stage.status] || statusBarStyle.upcoming}`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {stage.currentCount}/{stage.previousCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow between stages */}
              {!isLast && (
                <div className="flex justify-center py-0.5">
                  <ChevronDown size={16} className="text-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============ FOOTER ============ */}
      {isCompany ? (
        aiInsight && (
          <div className="mt-5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 shrink-0">
                <Sparkles size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-violet-700 mb-0.5">AI Hiring Insight</p>
                <p className="text-sm text-gray-700 leading-relaxed">{aiInsight}</p>
              </div>
            </div>
          </div>
        )
      ) : (
        actionRequired && (
          <div className="mt-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 shrink-0">
                <AlertCircle size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-0.5">Action Required</p>
                <p className="text-sm text-gray-700 leading-relaxed">{actionRequired}</p>
              </div>
            </div>
          </div>
        )
      )}

      {/* ============ ACTIONS ============ */}
      {(onViewPipeline || onManageJob) && (
        <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-100">
          {onViewPipeline && (
            <button
              onClick={onViewPipeline}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Eye size={14} />
              View Pipeline
            </button>
          )}
          {onManageJob && (
            <button
              onClick={onManageJob}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Settings size={14} />
              Manage Job
            </button>
          )}
        </div>
      )}

    </div>
  );
}

export default HiringPipelineCard;