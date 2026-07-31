import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInterviewTopics } from "@/services/jobService";
import {
  createRound,
  renumberRounds,
  validateWorkflowClient,
} from "@/lib/workflowDefaults";
import AddRoundDialog from "./AddRoundDialog";
import RoundCard from "./RoundCard";

function InterviewWorkflowBuilder({
  value = [],
  onChange,
  error,
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [topicLibrary, setTopicLibrary] = useState([]);
  const [codingLanguages, setCodingLanguages] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    let mounted = true;

    getInterviewTopics()
      .then((data) => {
        if (!mounted) return;
        setTopicLibrary(data.categories || []);
        setCodingLanguages(data.codingLanguages || []);
      })
      .catch(() => {
        if (mounted) {
          toast.error("Failed to load topic library");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setRounds = (next) => {
    onChange(renumberRounds(next));
  };

  const handleAdd = (type) => {
    setRounds([...value, createRound(type, value.length + 1)]);
  };

  const handleUpdate = (id, partial) => {
    setRounds(
      value.map((round) =>
        round.id === id ? { ...round, ...partial } : round
      )
    );
  };

  const handleDelete = (id) => {
    setRounds(value.filter((round) => round.id !== id));
  };

  const handleDragStart = (_e, index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex == null || dragIndex === dropIndex) return;

    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    setRounds(next);
    setDragIndex(null);
  };

  const summary = value
    .filter((r) => r.enabled)
    .map((r) => r.title || r.type);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Interview Workflow Builder</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Define ordered interview rounds for this job. AI will generate
              questions from the selected topics later.
            </p>
          </div>
          <Button
            type="button"
            className="rounded-xl bg-black hover:bg-neutral-800"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Round
          </Button>
        </CardHeader>

        {summary.length > 0 ? (
          <CardContent className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Current Workflow
            </p>
            <ol className="flex flex-wrap gap-2">
              {summary.map((label, i) => (
                <li
                  key={`${label}-${i}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  <span className="mr-1 font-semibold text-slate-900">
                    {i + 1}.
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </CardContent>
        ) : null}
      </Card>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      {value.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
          No rounds yet. Click Add Round to build the interview workflow.
        </div>
      ) : (
        <div className="space-y-4">
          {value.map((round, index) => (
            <RoundCard
              key={round.id}
              round={round}
              index={index}
              topicLibrary={topicLibrary}
              codingLanguages={codingLanguages}
              onUpdate={(partial) => handleUpdate(round.id, partial)}
              onDelete={() => handleDelete(round.id)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      <AddRoundDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAdd}
      />
    </div>
  );
}

export { validateWorkflowClient };
export default InterviewWorkflowBuilder;
