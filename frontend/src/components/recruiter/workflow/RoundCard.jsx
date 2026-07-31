import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import RoundSettingsForm from "./RoundSettingsForm";

function RoundCard({
  round,
  index,
  topicLibrary,
  codingLanguages,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`rounded-3xl border border-slate-200 shadow-sm transition ${
        round.enabled ? "bg-white" : "bg-slate-50 opacity-80"
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            type="button"
            className="mt-1 cursor-grab touch-none text-slate-400 active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {round.order}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {round.type}
              </span>
            </div>
            <Input
              value={round.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="rounded-xl font-medium"
              placeholder="Round title"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Label className="text-xs text-slate-500">Enabled</Label>
            <Switch
              checked={round.enabled}
              onCheckedChange={(enabled) => onUpdate({ enabled })}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="rounded-xl"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {expanded ? (
        <CardContent className="border-t border-slate-100 pt-4">
          <RoundSettingsForm
            round={round}
            topicLibrary={topicLibrary}
            codingLanguages={codingLanguages}
            onChange={(settings) => onUpdate({ settings })}
          />
        </CardContent>
      ) : null}
    </Card>
  );
}

export default RoundCard;
