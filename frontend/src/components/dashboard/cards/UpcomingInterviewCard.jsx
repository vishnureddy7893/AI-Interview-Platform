import {
  CalendarDays,
  Clock,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function UpcomingInterviewCard() {
  return (
    <Card className="rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all">

      <CardContent className="p-6">

        {/* Header */}

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Upcoming Interview
          </h2>

          <button className="text-green-600 font-medium hover:underline">
            View All
          </button>

        </div>

        {/* Company */}

        <div className="mt-6 flex items-center gap-4">

          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="h-14 w-14 rounded-full border p-2 bg-white"
          />

          <div>

            <h3 className="text-2xl font-bold">
              Google
            </h3>

            <p className="text-gray-500">
              Software Engineer
            </p>

            <span className="inline-block mt-2 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
              Technical Interview
            </span>

          </div>

        </div>

        {/* Date */}

        <div className="mt-8 space-y-3">

          <div className="flex items-center gap-3 text-gray-600">

            <CalendarDays size={18} />

            Tomorrow, 24 May 2026

          </div>

          <div className="flex items-center gap-3 text-gray-600">

            <Clock size={18} />

            10:00 AM

          </div>

        </div>

        {/* Button */}

        <Button
          className="mt-8 inline-flex w-fit rounded-xl bg-black hover:bg-zinc-800 px-6"
        >

          View Details

          <ArrowRight className="ml-2 h-4 w-4" />

        </Button>

      </CardContent>

    </Card>
  );
}

export default UpcomingInterviewCard;