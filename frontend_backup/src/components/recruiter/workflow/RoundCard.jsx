import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, CheckCircle, AlertCircle } from "lucide-react";

const RoundCard = ({
  index,
  round,
  workflow,
  setWorkflow,
  setSelectedRound,
  setIsConfigOpen,
}) => {

  const handleDelete = () => {

    setWorkflow((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((item) => item.id !== round.id),
    }));

  };

  const handleConfigure = () => {

    setSelectedRound(round);

    setIsConfigOpen(true);

  };

  return (
    <Card>

      <CardContent className="flex items-center justify-between py-5">

        <div>

          <h3 className="text-lg font-semibold">

            Round {index + 1}

          </h3>

          <p className="text-muted-foreground">

            {round.type}

          </p>

          <div className="mt-3">

            {round.configured ? (

              <Badge className="gap-1">

                <CheckCircle className="h-3 w-3" />

                Configured

              </Badge>

            ) : (

              <Badge variant="destructive" className="gap-1">

                <AlertCircle className="h-3 w-3" />

                Not Configured

              </Badge>

            )}

          </div>

        </div>

        <div className="flex gap-3">

          <Button
            variant="outline"
            onClick={handleConfigure}
          >
            <Settings className="mr-2 h-4 w-4" />

            {round.configured ? "Edit" : "Configure"}

          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />

            Delete

          </Button>

        </div>

      </CardContent>

    </Card>
  );

};

export default RoundCard;