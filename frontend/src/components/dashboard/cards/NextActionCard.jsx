import { ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function NextActionCard() {
  return (
    <Card className="rounded-3xl border bg-white shadow-sm">

      <CardContent className="p-8">

        <div className="grid lg:grid-cols-3 gap-8 items-center">

          {/* Left */}

          <div className="lg:col-span-2">

            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 font-medium">

              <Target size={18} />

              Next Action

            </div>

            <h2 className="mt-6 text-4xl font-bold text-slate-900">

              Complete your Academic Details

            </h2>

            <p className="mt-5 text-slate-500 text-lg">

              Complete your academic profile to unlock
              more opportunities and personalized
              recommendations.

            </p>

            <Button
              className="mt-8 rounded-xl bg-black hover:bg-neutral-800 px-8 py-6"
            >
              Continue Now

              <ArrowRight className="ml-2 h-5 w-5" />

            </Button>

          </div>

          {/* Right */}

          <div className="flex justify-center">

            <div className="relative h-56 w-56">

              <svg
                className="-rotate-90"
                width="224"
                height="224"
              >

                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />

                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  stroke="#22C55E"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="565"
                  strokeDashoffset="198"
                />

              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">

                <h1 className="text-5xl font-bold">

                  65%

                </h1>

                <p className="text-gray-500">

                  Profile Completion

                </p>

              </div>

            </div>

          </div>

        </div>

      </CardContent>

    </Card>
  );
}

export default NextActionCard;