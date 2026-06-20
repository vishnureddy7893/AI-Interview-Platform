import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

const ROUND_TYPES = [
  "Resume Screening",
  "Assessment",
  "Coding",
  "AI Technical Interview",
  "HR Interview",
];

const AddRoundDialog = ({
  open,
  setOpen,
  workflow,
  setWorkflow,
}) => {

  const [selectedRound, setSelectedRound] = useState("");

  const handleAddRound = () => {

    if (!selectedRound) return;

    const newRound = {
      id: crypto.randomUUID(),
      type: selectedRound,
      configured: false,
      config: null,
    };

    setWorkflow((prev) => ({
      ...prev,
      rounds: [...prev.rounds, newRound],
    }));

    setSelectedRound("");

    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent>

        <DialogHeader>

          <DialogTitle>

            Add Interview Round

          </DialogTitle>

        </DialogHeader>

        <div className="space-y-3">

          {ROUND_TYPES.map((round) => (

            <Button
              key={round}
              variant={
                selectedRound === round
                  ? "default"
                  : "outline"
              }
              className="w-full justify-start"
              onClick={() => setSelectedRound(round)}
            >
              {round}
            </Button>

          ))}

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleAddRound}
          >
            Continue
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default AddRoundDialog;