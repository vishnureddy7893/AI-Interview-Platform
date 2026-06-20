import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

const steps = [
  { title: "Applied", completed: true },
  { title: "Resume Reviewed", completed: true },
  { title: "Assessment", completed: true },
  { title: "Technical Interview", completed: true },
  { title: "HR Interview", completed: false },
  { title: "Offer", completed: false },
];

function TimelineCard() {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader>
        <CardTitle>
          Application Timeline
        </CardTitle>
      </CardHeader>

      <CardContent>

        <div className="space-y-5">

          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-4"
            >

              <div className="flex flex-col items-center">

                {step.completed ? (
                  <CheckCircle2
                    className="text-green-600"
                    size={22}
                  />
                ) : (
                  <Circle
                    className="text-gray-300"
                    size={22}
                  />
                )}

                {index !== steps.length - 1 && (
                  <div className="w-[2px] h-10 bg-gray-300 mt-1"></div>
                )}

              </div>

              <div>

                <p className="font-medium">
                  {step.title}
                </p>

              </div>

            </div>
          ))}

        </div>

      </CardContent>
    </Card>
  );
}

export default TimelineCard;