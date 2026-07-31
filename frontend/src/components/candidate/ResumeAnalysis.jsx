import { useEffect, useState } from "react";
import {
  Award,
  Briefcase,
  Code2,
  GraduationCap,
  Languages,
  Loader2,
  Sparkles,
  User,
  FolderKanban,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getResumeAnalysis,
  parseResume,
} from "@/services/candidateService";
import { formatUploadDate } from "@/lib/profileCompletion";

function SkillGroup({ title, items }) {
  if (!items?.length) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((skill) => (
          <span
            key={`${title}-${skill}`}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children, empty }) {
  return (
    <Card className="rounded-3xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-green-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-slate-400">No data extracted</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function ResumeAnalysis({ hasResume, onParsed }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!hasResume) {
        if (mounted) {
          setAnalysis(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const data = await getResumeAnalysis();
        if (mounted) setAnalysis(data.parsedResume || null);
      } catch (error) {
        if (mounted && error.response?.status !== 404) {
          toast.error(
            error.response?.data?.message || "Failed to load analysis"
          );
        }
        if (mounted) setAnalysis(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [hasResume]);

  const handleAnalyze = async () => {
    if (!hasResume) {
      toast.error("Upload a resume before analyzing");
      return;
    }

    try {
      setAnalyzing(true);
      setProgressLabel("Reading PDF…");
      await new Promise((r) => setTimeout(r, 300));
      setProgressLabel("Extracting text…");
      await new Promise((r) => setTimeout(r, 300));
      setProgressLabel("Running AI analysis…");

      const data = await parseResume();
      setAnalysis(data.parsedResume || null);
      onParsed?.(data.parsedResume || null);
      toast.success(data.message || "Resume analyzed successfully");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      const apiMessage =
        data && typeof data === "object" ? data.message : null;

      toast.error(
        apiMessage ||
          (status === 404
            ? "Resume analysis endpoint not found. Restart the backend server."
            : null) ||
          (error.message === "Network Error"
            ? "AI service unavailable"
            : null) ||
          "Resume analysis failed"
      );
    } finally {
      setAnalyzing(false);
      setProgressLabel("");
    }
  };

  if (!hasResume) {
    return null;
  }

  const personal = analysis?.personal || {};
  const skills = analysis?.skills || {};

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-gray-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              AI Resume Analysis
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {analysis?.parsedAt
                ? `Last analyzed ${formatUploadDate(analysis.parsedAt)}${
                    analysis.aiVersion ? ` · ${analysis.aiVersion}` : ""
                  }`
                : "Extract skills, education, projects, and experience with AI."}
            </p>
          </div>

          <Button
            className="rounded-xl bg-black hover:bg-neutral-800"
            disabled={analyzing || loading}
            onClick={handleAnalyze}
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {analysis ? "Re-analyze Resume" : "Analyze Resume"}
              </>
            )}
          </Button>
        </CardContent>

        {analyzing && (
          <div className="border-t border-slate-100 px-6 py-4">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
              <span>{progressLabel || "Working…"}</span>
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-green-500" />
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analysis…
        </div>
      ) : analysis ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon={User} title="Profile Summary">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-400">Name</dt>
                <dd className="font-medium text-slate-800">
                  {personal.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Email</dt>
                <dd className="font-medium text-slate-800">
                  {personal.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Phone</dt>
                <dd className="font-medium text-slate-800">
                  {personal.phone || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Location</dt>
                <dd className="font-medium text-slate-800">
                  {personal.location || "—"}
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard
            icon={Code2}
            title="Skills"
            empty={
              !Object.values(skills).some((list) => list?.length)
            }
          >
            <div className="space-y-4">
              <SkillGroup
                title="Programming Languages"
                items={skills.programmingLanguages}
              />
              <SkillGroup title="Frameworks" items={skills.frameworks} />
              <SkillGroup title="Libraries" items={skills.libraries} />
              <SkillGroup title="Databases" items={skills.databases} />
              <SkillGroup title="Cloud" items={skills.cloud} />
              <SkillGroup title="Tools" items={skills.tools} />
              <SkillGroup title="Soft Skills" items={skills.softSkills} />
            </div>
          </SectionCard>

          <SectionCard
            icon={GraduationCap}
            title="Education"
            empty={!analysis.education?.length}
          >
            <div className="space-y-4">
              {analysis.education?.map((edu, index) => (
                <div
                  key={`edu-${index}`}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {edu.degree || "Degree"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {edu.university || "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {[edu.year, edu.cgpa ? `CGPA ${edu.cgpa}` : null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={Briefcase}
            title="Experience"
            empty={!analysis.experience?.length}
          >
            <div className="space-y-4">
              {analysis.experience?.map((exp, index) => (
                <div
                  key={`exp-${index}`}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {exp.role || "Role"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {exp.company || "—"}
                    {exp.duration ? ` · ${exp.duration}` : ""}
                  </p>
                  {exp.description ? (
                    <p className="mt-2 text-sm text-slate-500">
                      {exp.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={FolderKanban}
            title="Projects"
            empty={!analysis.projects?.length}
          >
            <div className="space-y-4">
              {analysis.projects?.map((project, index) => (
                <div
                  key={`proj-${index}`}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {project.title || "Project"}
                  </p>
                  {project.description ? (
                    <p className="mt-1 text-sm text-slate-500">
                      {project.description}
                    </p>
                  ) : null}
                  {project.technologies?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={`${index}-${tech}`}
                          className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={Award}
            title="Certifications"
            empty={!analysis.certifications?.length}
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {analysis.certifications?.map((item, index) => (
                <li key={`cert-${index}`}>
                  {typeof item === "string" ? item : item?.name || "—"}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={Trophy}
            title="Achievements"
            empty={!analysis.achievements?.length}
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {analysis.achievements?.map((item, index) => (
                <li key={`ach-${index}`}>{item}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={Languages}
            title="Languages"
            empty={!analysis.languages?.length}
          >
            <div className="flex flex-wrap gap-2">
              {analysis.languages?.map((lang) => (
                <span
                  key={lang}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {lang}
                </span>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400">
          No analysis yet. Click Analyze Resume to extract profile data.
        </p>
      )}
    </div>
  );
}

export default ResumeAnalysis;
