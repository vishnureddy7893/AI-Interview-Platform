import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function AIRecommendationCard() {
  return (
    <Card className="rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all">

      <CardContent className="p-6">

        {/* Header */}

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            AI Recommendation
          </h2>

          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            Beta
          </span>

        </div>

        {/* Job */}

        <div className="mt-6 flex items-start gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            🪟
          </div>

          <div className="flex-1">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold">
                  Backend Developer
                </h3>

                <p className="text-gray-500">
                  Microsoft
                </p>

              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                95% Match
              </span>

            </div>

          </div>

        </div>

        {/* Why it matches */}

        <div className="mt-6">

          <p className="mb-3 font-medium">
            Why it matches?
          </p>

          <div className="space-y-2">

            <div className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={18} />
              Skills match
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={18} />
              Experience match
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Check className="text-green-600" size={18} />
              Profile relevance
            </div>

          </div>

        </div>

        <Button
          className="mt-8 inline-flex w-fit rounded-xl bg-black hover:bg-zinc-800"
        >
          View Job

          <ArrowRight className="ml-2 h-4 w-4" />

        </Button>

      </CardContent>

    </Card>
  );
}

export default AIRecommendationCard;