import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AssessmentConfig from "./configs/AssessmentConfig";
import CodingConfig from "./configs/CodingConfig";
import ResumeConfig from "./configs/ResumeConfig";
import AIInterviewConfig from "./configs/AIInterviewConfig";
import HRInterviewConfig from "./configs/HRInterviewConfig";

const RoundConfigDialog = ({
  open,
  setOpen,
  selectedRound,
  workflow,
  setWorkflow,
}) => {

  if (!selectedRound) return null;

  const renderConfig = () => {

    switch (selectedRound.type) {

      case "Resume Screening":
        return <ResumeConfig />;

      case "Assessment":
        return <AssessmentConfig />;

      case "Coding":
        return <CodingConfig />;

      case "AI Technical Interview":
        return <AIInterviewConfig />;

      case "HR Interview":
        return <HRInterviewConfig />;

      default:
        return null;

    }

  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent className="max-w-5xl">

        <DialogHeader>

          <DialogTitle>

            Configure {selectedRound.type}

          </DialogTitle>

        </DialogHeader>

        {renderConfig()}

      </DialogContent>
    </Dialog>
  );
};

export default RoundConfigDialog;