import TimelineCard from "../cards/TimelineCard";
import UpcomingInterviewCard from "../cards/UpcomingInterviewCard";
import RecentActivityCard from "../cards/RecentActivityCard";
import AIRecommendationCard from "../cards/AIRecommendationCard";

function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <TimelineCard />

      <UpcomingInterviewCard />

      <RecentActivityCard />

      <AIRecommendationCard />

    </div>
  );
}

export default DashboardGrid;