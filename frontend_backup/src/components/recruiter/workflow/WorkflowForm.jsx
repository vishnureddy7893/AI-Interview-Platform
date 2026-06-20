import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const WorkflowForm = ({ workflow, setWorkflow }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;

    setWorkflow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card>

      <CardHeader>

        <CardTitle>
          Workflow Information
        </CardTitle>

      </CardHeader>

      <CardContent className="space-y-6">

        {/* First Row */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <Label>
              Workflow Name
            </Label>

            <Input
              name="workflowName"
              value={workflow.workflowName}
              onChange={handleChange}
              placeholder="Backend Developer Hiring"
            />

          </div>

          <div>

            <Label>
              Job Role
            </Label>

            <Input
              name="jobRole"
              value={workflow.jobRole}
              onChange={handleChange}
              placeholder="Backend Developer"
            />

          </div>

        </div>

        {/* Second Row */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <Label>
              Department
            </Label>

            <Input
              name="department"
              value={workflow.department}
              onChange={handleChange}
              placeholder="Engineering"
            />

          </div>

          <div>

            <Label>
              Experience
            </Label>

            <Input
              name="experience"
              value={workflow.experience}
              onChange={handleChange}
              placeholder="0 - 2 Years"
            />

          </div>

        </div>

        {/* Description */}

        <div>

          <Label>
            Description
          </Label>

          <Textarea
            rows={5}
            name="description"
            value={workflow.description}
            onChange={handleChange}
            placeholder="Describe this hiring workflow..."
          />

        </div>

      </CardContent>

    </Card>
  );
};

export default WorkflowForm;