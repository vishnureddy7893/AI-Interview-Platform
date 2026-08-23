import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InterviewWorkflowBuilder, {
  validateWorkflowClient,
} from "@/components/recruiter/workflow/InterviewWorkflowBuilder";
import {
  archiveJob,
  createJob,
  getJob,
  updateJob,
  updateJobWorkflow,
} from "@/services/jobService";

function getAuthUser() {
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    return auth?.user || null;
  } catch {
    return null;
  }
}

const EMPTY_FORM = {
  title: "",
  department: "",
  location: "",
  workMode: "Hybrid",
  employmentType: "Full Time",
  experience: "",
  openings: 1,
  salaryMin: 0,
  salaryMax: 0,
  description: "",
  requirements: "",
  skills: "",
};

function RecruiterCreateJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);

  const user = useMemo(() => getAuthUser(), []);
  const [form, setForm] = useState(EMPTY_FORM);
  const [workflow, setWorkflow] = useState([]);
  const [workflowError, setWorkflowError] = useState("");
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!user?._id) {
      navigate("/recruiter/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!isEdit) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getJob(jobId);
        if (!mounted) return;
        const job = data.job;
        setForm({
          title: job.title || "",
          department: job.department || "",
          location: job.location || "",
          workMode: job.workMode || "Hybrid",
          employmentType: job.employmentType || "Full Time",
          experience: job.experience || "",
          openings: job.openings || 1,
          salaryMin: job.salaryMin || 0,
          salaryMax: job.salaryMax || 0,
          description: job.description || "",
          requirements: job.requirements || "",
          skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
        });
        setWorkflow(job.interviewWorkflow || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load job"
        );
        navigate("/recruiter/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isEdit, jobId, navigate]);

  const patchForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.department.trim() || !form.location.trim()) {
      toast.error("Title, department, and location are required");
      return;
    }

    if (!form.experience.trim()) {
      toast.error("Experience is required");
      return;
    }

    const wfError = validateWorkflowClient(workflow);
    setWorkflowError(wfError || "");
    if (wfError) {
      toast.error(wfError);
      return;
    }

    try {
      setSaving(true);

      const fields = {
        title: form.title.trim(),
        department: form.department.trim(),
        location: form.location.trim(),
        workMode: form.workMode,
        employmentType: form.employmentType,
        experience: form.experience.trim(),
        openings: Number(form.openings) || 1,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
        description: form.description,
        requirements: form.requirements,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (isEdit) {
        await updateJob(jobId, fields);
        await updateJobWorkflow(jobId, workflow);
        toast.success("Job updated successfully");
        navigate("/recruiter/dashboard");
        return;
      }

      const payload = {
        ...fields,
        recruiterId: user._id,
        companyName: user.companyName,
        interviewWorkflow: workflow,
      };

      const data = await createJob(payload);
      toast.success("Job created successfully");
      navigate(`/recruiter/jobs/${data.job._id}/edit`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save job"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    const confirmClose = window.confirm(
      "Close this job? It will stop appearing in active job listings. This does not delete the job or any existing applications."
    );
    if (!confirmClose) return;

    try {
      setClosing(true);
      await archiveJob(jobId);
      toast.success("Job closed");
      navigate("/recruiter/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to close job"
      );
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading job…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => navigate("/recruiter/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEdit ? "Edit Interview Workflow" : "Create Job"}
              </h1>
              <p className="text-sm text-slate-500">
                {isEdit
                  ? "Update rounds, settings, and ordering"
                  : "Job details plus interview workflow"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEdit ? (
              <Button
                type="button"
                variant="outline"
                disabled={closing}
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleClose}
              >
                {closing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Close Job
              </Button>
            ) : null}
            <Button
              type="submit"
              form="create-job-form"
              disabled={saving}
              className="rounded-xl bg-black hover:bg-neutral-800"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEdit ? "Save Workflow" : "Create Job"}
            </Button>
          </div>
        </div>
      </div>

      <form
        id="create-job-form"
        onSubmit={handleSave}
        className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8"
      >
        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Job Title</Label>
                <Input
                  className="rounded-xl"
                  value={form.title}
                  onChange={(e) => patchForm("title", e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input
                  className="rounded-xl"
                  value={form.department}
                  onChange={(e) => patchForm("department", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  className="rounded-xl"
                  value={form.location}
                  onChange={(e) => patchForm("location", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Work Mode</Label>
                <select
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.workMode}
                  onChange={(e) => patchForm("workMode", e.target.value)}
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>Onsite</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Employment Type</Label>
                <select
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
                  value={form.employmentType}
                  onChange={(e) =>
                    patchForm("employmentType", e.target.value)
                  }
                >
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Experience</Label>
                <Input
                  className="rounded-xl"
                  value={form.experience}
                  onChange={(e) => patchForm("experience", e.target.value)}
                  placeholder="e.g. 0-2 years"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Openings</Label>
                <Input
                  type="number"
                  min={1}
                  className="rounded-xl"
                  value={form.openings}
                  onChange={(e) => patchForm("openings", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Skills (comma separated)</Label>
                <Input
                  className="rounded-xl"
                  value={form.skills}
                  onChange={(e) => patchForm("skills", e.target.value)}
                  placeholder="Java, React, MongoDB"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  className="min-h-24 rounded-xl"
                  value={form.description}
                  onChange={(e) => patchForm("description", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Requirements</Label>
                <Textarea
                  className="min-h-24 rounded-xl"
                  value={form.requirements}
                  onChange={(e) => patchForm("requirements", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

        <InterviewWorkflowBuilder
          value={workflow}
          onChange={setWorkflow}
          error={workflowError}
        />
      </form>
    </div>
  );
}

export default RecruiterCreateJob;
