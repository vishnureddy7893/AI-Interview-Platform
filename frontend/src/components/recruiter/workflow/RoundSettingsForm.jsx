import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DIFFICULTIES } from "@/lib/workflowDefaults";

function NumberField({ label, value, onChange, min = 1 }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-600">{label}</Label>
      <Input
        type="number"
        min={min}
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-xl"
      />
    </div>
  );
}

function DifficultyField({ value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-600">Difficulty</Label>
      <select
        className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
        value={value || "Medium"}
        onChange={(e) => onChange(e.target.value)}
      >
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}

function TopicPicker({
  label,
  categories = [],
  selected = [],
  onChange,
}) {
  const toggle = (topic) => {
    if (selected.includes(topic)) {
      onChange(selected.filter((t) => t !== topic));
    } else {
      onChange([...selected, topic]);
    }
  };

  return (
    <div className="space-y-3 sm:col-span-2">
      <Label className="text-sm text-slate-600">{label}</Label>
      <div className="max-h-56 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {categories.map((group) => (
          <div key={group.category}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {group.category}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.topics.map((topic) => {
                const checked = selected.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggle(topic)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      checked
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundSettingsForm({ round, topicLibrary, codingLanguages, onChange }) {
  const settings = round.settings || {};
  const categories = topicLibrary || [];

  const patch = (partial) => {
    onChange({
      ...settings,
      ...partial,
    });
  };

  if (round.type === "Aptitude") {
    const aptitudeCategory =
      categories.find((c) => c.category === "Aptitude") || {
        category: "Aptitude",
        topics: [],
      };

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <TopicPicker
          label="Sections"
          categories={[aptitudeCategory]}
          selected={settings.sections || []}
          onChange={(sections) => patch({ sections })}
        />
        <DifficultyField
          value={settings.difficulty}
          onChange={(difficulty) => patch({ difficulty })}
        />
        <NumberField
          label="Question Count"
          value={settings.questionCount}
          onChange={(questionCount) => patch({ questionCount })}
        />
        <NumberField
          label="Duration (minutes)"
          value={settings.duration}
          onChange={(duration) => patch({ duration })}
        />
        <NumberField
          label="Passing Score (%)"
          value={settings.passingScore}
          min={0}
          onChange={(passingScore) => patch({ passingScore })}
        />
      </div>
    );
  }

  if (round.type === "Technical") {
    return (
      <div className="space-y-4">
        <TopicPicker
          label="Topics"
          categories={categories.filter((c) => c.category !== "Aptitude")}
          selected={settings.topics || []}
          onChange={(topics) => patch({ topics })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <DifficultyField
            value={settings.difficulty}
            onChange={(difficulty) => patch({ difficulty })}
          />
          <NumberField
            label="Question Count"
            value={settings.questionCount}
            onChange={(questionCount) => patch({ questionCount })}
          />
          <NumberField
            label="Duration (minutes)"
            value={settings.duration}
            onChange={(duration) => patch({ duration })}
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <Label>Adaptive</Label>
            <Switch
              checked={Boolean(settings.adaptive)}
              onCheckedChange={(adaptive) => patch({ adaptive })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (round.type === "Coding") {
    const dsa =
      categories.filter((c) =>
        ["DSA", "Java", "React", "Node.js"].includes(c.category)
      ) || [];

    const toggleLanguage = (lang) => {
      const current = settings.language || [];
      patch({
        language: current.includes(lang)
          ? current.filter((l) => l !== lang)
          : [...current, lang],
      });
    };

    return (
      <div className="space-y-4">
        <TopicPicker
          label="Topics"
          categories={dsa.length ? dsa : categories}
          selected={settings.topics || []}
          onChange={(topics) => patch({ topics })}
        />
        <div>
          <Label className="mb-2 block text-sm text-slate-600">
            Languages
          </Label>
          <div className="flex flex-wrap gap-2">
            {(codingLanguages || []).map((lang) => {
              const checked = (settings.language || []).includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    checked
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DifficultyField
            value={settings.difficulty}
            onChange={(difficulty) => patch({ difficulty })}
          />
          <NumberField
            label="Question Count"
            value={settings.questionCount}
            onChange={(questionCount) => patch({ questionCount })}
          />
          <NumberField
            label="Duration (minutes)"
            value={settings.duration}
            onChange={(duration) => patch({ duration })}
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <Label>Hidden Test Cases</Label>
            <Switch
              checked={Boolean(settings.hiddenTestCases)}
              onCheckedChange={(hiddenTestCases) =>
                patch({ hiddenTestCases })
              }
            />
          </div>
          <NumberField
            label="Warning Limit"
            value={settings.warningLimit ?? 3}
            min={1}
            onChange={(warningLimit) => patch({ warningLimit })}
          />
          <NumberField
            label="Idle Timeout (seconds)"
            value={settings.idleTimeoutSeconds ?? 60}
            min={15}
            onChange={(idleTimeoutSeconds) =>
              patch({ idleTimeoutSeconds })
            }
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
            <Label>Auto-submit at warning limit</Label>
            <Switch
              checked={Boolean(settings.autoSubmitOnWarningLimit)}
              onCheckedChange={(autoSubmitOnWarningLimit) =>
                patch({ autoSubmitOnWarningLimit })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  if (round.type === "HR") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Question Count"
          value={settings.questionCount}
          onChange={(questionCount) => patch({ questionCount })}
        />
        <NumberField
          label="Duration (minutes)"
          value={settings.duration}
          onChange={(duration) => patch({ duration })}
        />
        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <Label>Voice Enabled</Label>
          <Switch
            checked={Boolean(settings.voiceEnabled)}
            onCheckedChange={(voiceEnabled) => patch({ voiceEnabled })}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <Label>Video Enabled</Label>
          <Switch
            checked={Boolean(settings.videoEnabled)}
            onCheckedChange={(videoEnabled) => patch({ videoEnabled })}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
          <Label>Adaptive</Label>
          <Switch
            checked={Boolean(settings.adaptive)}
            onCheckedChange={(adaptive) => patch({ adaptive })}
          />
        </div>
      </div>
    );
  }

  if (round.type === "Project Discussion") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Question Count"
          value={settings.questionCount}
          onChange={(questionCount) => patch({ questionCount })}
        />
        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <Label>Use Resume Projects</Label>
          <Switch
            checked={Boolean(settings.useResumeProjects)}
            onCheckedChange={(useResumeProjects) =>
              patch({ useResumeProjects })
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
          <Label>Adaptive</Label>
          <Switch
            checked={Boolean(settings.adaptive)}
            onCheckedChange={(adaptive) => patch({ adaptive })}
          />
        </div>
      </div>
    );
  }

  if (round.type === "System Design") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <DifficultyField
          value={settings.difficulty}
          onChange={(difficulty) => patch({ difficulty })}
        />
        <NumberField
          label="Question Count"
          value={settings.questionCount}
          onChange={(questionCount) => patch({ questionCount })}
        />
        <NumberField
          label="Duration (minutes)"
          value={settings.duration}
          onChange={(duration) => patch({ duration })}
        />
      </div>
    );
  }

  return null;
}

export default RoundSettingsForm;
