import { useEffect, useState } from "react";
import { ArrowRight, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCandidateProfile } from "@/services/candidateService";
import { getProfileCompletion } from "@/lib/profileCompletion";

function getAuthUser() {
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    return auth?.user || null;
  } catch {
    return null;
  }
}

function NextActionCard({ onNavigate, refreshKey = 0 }) {
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [nextAction, setNextAction] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const user = getAuthUser();
      if (!user?.email) {
        if (mounted) {
          setLoading(false);
          setPercentage(0);
          setNextAction({
            label: "Complete your Personal Details",
            page: "profile",
          });
        }
        return;
      }

      try {
        setLoading(true);
        const data = await getCandidateProfile(user.email);
        if (!mounted) return;

        const result = getProfileCompletion(data.candidate);
        setPercentage(result.percentage);
        setNextAction(result.nextAction);
      } catch (error) {
        if (mounted) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load profile completion"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (circumference * Math.min(percentage, 100)) / 100;

  return (
    <Card className="rounded-3xl border bg-white shadow-sm">
      <CardContent className="p-8">
        <div className="grid items-center gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 font-medium text-green-700">
              <Target size={18} />
              Next Action
            </div>

            <h2 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">
              {loading
                ? "Checking your profile…"
                : nextAction?.label || "Your profile looks complete"}
            </h2>

            <p className="mt-5 text-lg text-slate-500">
              Profile completion includes personal details, academics,
              projects, certifications, and your resume.
            </p>

            <Button
              className="mt-8 rounded-xl bg-black px-8 py-6 hover:bg-neutral-800"
              disabled={loading || nextAction?.key === "done"}
              onClick={() => onNavigate?.(nextAction?.page || "profile")}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  Continue Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-center">
            <div className="relative h-56 w-56">
              <svg className="-rotate-90" width="224" height="224">
                <circle
                  cx="112"
                  cy="112"
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="112"
                  cy="112"
                  r={radius}
                  stroke="#22C55E"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={loading ? circumference : offset}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h1 className="text-5xl font-bold">
                  {loading ? "…" : `${percentage}%`}
                </h1>
                <p className="text-gray-500">Profile Completion</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NextActionCard;
