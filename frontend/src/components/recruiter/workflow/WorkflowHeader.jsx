import { motion } from "framer-motion";
import { BriefcaseBusiness } from "lucide-react";

const WorkflowHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <BriefcaseBusiness className="h-7 w-7 text-primary" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Workflow
          </h1>

          <p className="mt-1 text-muted-foreground">
            Design reusable hiring workflows for different job roles and interview processes.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkflowHeader;