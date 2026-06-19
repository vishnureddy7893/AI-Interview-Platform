import { useState } from "react";
import WorkflowHeader from "./WorkflowHeader";
import WorkflowForm from "./WorkflowForm";
import WorkflowRounds from "./WorkflowRounds";
import ReviewWorkflow from "./ReviewWorkflow";
import AddRoundDialog from "./AddRoundDialog";
import RoundConfigDialog from "./RoundConfigDialog";

const WorkflowBuilder = () => {
  const [workflow, setWorkflow] = useState({
    workflowName: "",
    jobRole: "",
    department: "",
    experience: "",
    skills: [],
    description: "",
    rounds: [],
    status: "DRAFT",
  });

  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);

  const [selectedRound, setSelectedRound] = useState(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="space-y-6">

        <WorkflowHeader />

        <WorkflowForm
    workflow={workflow}
    setWorkflow={setWorkflow}
/>
       <WorkflowRounds
    workflow={workflow}
    setWorkflow={setWorkflow}
    setIsAddRoundOpen={setIsAddRoundOpen}
    setSelectedRound={setSelectedRound}
    setIsConfigOpen={setIsConfigOpen}
/>
        <ReviewWorkflow
    workflow={workflow}
/>

        <AddRoundDialog
    open={isAddRoundOpen}
    setOpen={setIsAddRoundOpen}
    workflow={workflow}
    setWorkflow={setWorkflow}
/>
<RoundConfigDialog
    open={isConfigOpen}
    setOpen={setIsConfigOpen}
    selectedRound={selectedRound}
    workflow={workflow}
    setWorkflow={setWorkflow}
/>

    </div>
)
};

export default WorkflowBuilder;