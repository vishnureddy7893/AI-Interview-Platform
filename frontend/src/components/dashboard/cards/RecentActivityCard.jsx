import { Activity, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function RecentActivityCard() {
  const activities = [
    "Logged in successfully",
    "Resume uploaded",
    "Profile updated",
    "Applied for Software Engineer",
  ];

  return (
    <Card className="rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all">

      <CardContent className="p-6">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Recent Activity
          </h2>

          <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center">
            <Activity className="text-green-600" size={24} />
          </div>

        </div>

        <div className="mt-6 space-y-5">

          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <CheckCircle2
                size={18}
                className="text-green-600"
              />

              <p className="text-gray-700">
                {activity}
              </p>
            </div>
          ))}

        </div>

      </CardContent>

    </Card>
  );
}

export default RecentActivityCard;