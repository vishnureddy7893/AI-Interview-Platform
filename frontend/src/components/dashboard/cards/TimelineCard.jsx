import { Card, CardContent } from "@/components/ui/card";
import Timeline from "../widgets/Timeline";

function TimelineCard() {
  return (
    <Card className="rounded-3xl shadow-sm border">

      <CardContent className="p-8">

        <h2 className="text-xl font-bold">
          Application Timeline
        </h2>

        <Timeline />

      </CardContent>

    </Card>
  );
}

export default TimelineCard;