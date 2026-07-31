import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROUND_TYPES } from "@/lib/workflowDefaults";

function AddRoundDialog({ open, onOpenChange, onAdd }) {
  const [selected, setSelected] = useState("");

  const handleAdd = () => {
    if (!selected) return;
    onAdd(selected);
    setSelected("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Interview Round</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          {ROUND_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={selected === type ? "default" : "outline"}
              className="justify-start rounded-xl"
              onClick={() => setSelected(type)}
            >
              {type}
            </Button>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-black hover:bg-neutral-800"
            disabled={!selected}
            onClick={handleAdd}
          >
            Add Round
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddRoundDialog;
