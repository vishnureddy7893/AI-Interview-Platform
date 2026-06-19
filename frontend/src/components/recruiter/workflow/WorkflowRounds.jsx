import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import RoundCard from "./RoundCard";

const WorkflowRounds = ({
  workflow,
  setWorkflow,
  setIsAddRoundOpen,
  setSelectedRound,
  setIsConfigOpen,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interview Rounds</CardTitle>

          <Button onClick={() => setIsAddRoundOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Round
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {workflow.rounds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold">
              No rounds added yet
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Click "Add Round" to build your hiring workflow.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflow.rounds.map((round, index) => (
              <RoundCard
                key={round.id}
                index={index}
                round={round}
                workflow={workflow}
                setWorkflow={setWorkflow}
                setSelectedRound={setSelectedRound}
                setIsConfigOpen={setIsConfigOpen}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowRounds;