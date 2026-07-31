import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function MalpracticeWarningModal({ open, warning, onClose }) {
  if (!warning) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Warning {warning.warningNumber} of {warning.warningLimit}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-700">
            {warning.message}
          </DialogDescription>
        </DialogHeader>
        {warning.limitReached ? (
          <p className="text-sm text-amber-700">
            {warning.shouldAutoSubmit
              ? "Warning limit reached. Your assessment will be submitted automatically."
              : "Warning limit reached. Further events will continue to be logged."}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            className="rounded-xl bg-black hover:bg-neutral-800"
            onClick={onClose}
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MalpracticeWarningModal;
