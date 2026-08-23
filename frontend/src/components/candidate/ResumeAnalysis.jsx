import {
  Award,
  Briefcase,
  Code2,
  FolderKanban,
  GraduationCap,
  Languages,
  Loader2,
  Trophy,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResumeAnalysisStatus from "@/components/candidate/ResumeAnalysisStatus";
import { formatUploadDate } from "@/lib/profileCompletion";

/**
 * Read-only view of what the AI extracted from the resume.
 *
 * There is no "Analyze" button in the normal flow — analysis starts on upload
 * and runs in the background. A retry only appears when a job has actually
 * failed, and the parsed model/provider is never surfaced to candidates.
 */

function SkillGroup({ title, items }) {
  if (!items?.length) return null;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((skill) => (
          <span
            key={`${title}-${skill}`}
            className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-foreground"
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground">
            Nothing found in your resume for this section.
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function ResumeAnalysis({ hasResume, analysisState }) {
  const [retrying, setRetrying] = useState(false);

  const {
    status,
    analysis,
    message,
    canRetry,
    loading,
    inProgress,
    retry,
  } = analysisState;

  if (!hasResume) return null;

  const handleRetry = async () => {
    setRetrying(true);
    const result = await retry();
    setRetrying(false);
    if (!result.ok) toast.error(result.message);
  };

  const personal = analysis?.personal || {};
  const skills = analysis?.skills || {};
  const hasSkills = Object.values(skills).some((list) => list?.length);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          What we found in your resume
        </h2>
        {analysis?.parsedAt ? (
          <p className="text-xs text-muted-foreground">
            Updated {formatUploadDate(analysis.parsedAt)}
          </p>
        ) : null}
      </div>

      <ResumeAnalysisStatus
        status={status}
        message={message}
        canRetry={canRetry}
        retrying={retrying}
        onRetry={handleRetry}
      />

      {loading && !analysis ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your details…
        </div>
      ) : analysis ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard icon={User} title="Contact details">
            <dl>
              <DetailRow label="Name" value={personal.name} />
              <DetailRow label="Email" value={personal.email} />
              <DetailRow label="Phone" value={personal.phone} />
              <DetailRow label="Location" value={personal.location} />
            </dl>
          </SectionCard>

          <SectionCard icon={Code2} title="Skills" empty={!hasSkills}>
            <div className="space-y-4">
              <SkillGroup
                title="Programming languages"
                items={skills.programmingLanguages}
              />
              <SkillGroup title="Frameworks" items={skills.frameworks} />
              <SkillGroup title="Libraries" items={skills.libraries} />
              <SkillGroup title="Databases" items={skills.databases} />
              <SkillGroup title="Cloud" items={skills.cloud} />
              <SkillGroup title="Tools" items={skills.tools} />
              <SkillGroup title="Soft skills" items={skills.softSkills} />
            </div>
          </SectionCard>

          <SectionCard
            icon={GraduationCap}
            title="Education"
            empty={!analysis.education?.length}
          >
            <ul className="space-y-3">
              {analysis.education?.map((edu, index) => (
                <li key={`edu-${index}`} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium text-foreground">
                    {edu.degree || "Degree"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {edu.university || "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[edu.year, edu.cgpa ? `CGPA ${edu.cgpa}` : null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={Briefcase}
            title="Experience"
            empty={!analysis.experience?.length}
          >
            <ul className="space-y-3">
              {analysis.experience?.map((exp, index) => (
                <li key={`exp-${index}`} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium text-foreground">
                    {exp.role || "Role"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[exp.company, exp.duration].filter(Boolean).join(" · ") || "—"}
                  </p>
                  {exp.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {exp.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={FolderKanban}
            title="Projects"
            empty={!analysis.projects?.length}
          >
            <ul className="space-y-3">
              {analysis.projects?.map((project, index) => (
                <li key={`proj-${index}`} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium text-foreground">
                    {project.title || "Project"}
                  </p>
                  {project.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  ) : null}
                  {project.technologies?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={`${index}-${tech}`}
                          className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={Award}
            title="Certifications"
            empty={!analysis.certifications?.length}
          >
            <ul className="space-y-1.5 text-sm text-foreground">
              {analysis.certifications?.map((item, index) => (
                <li key={`cert-${index}`} className="flex gap-2">
                  <span className="text-muted-foreground">•</span>
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
            <ul className="space-y-1.5 text-sm text-foreground">
              {analysis.achievements?.map((item, index) => (
                <li key={`ach-${index}`} className="flex gap-2">
                  <span className="text-muted-foreground">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={Languages}
            title="Languages"
            empty={!analysis.languages?.length}
          >
            <div className="flex flex-wrap gap-1.5">
              {analysis.languages?.map((lang) => (
                <span
                  key={lang}
                  className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs"
                >
                  {lang}
                </span>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : inProgress ? null : (
        <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No details extracted yet.
        </div>
      )}
    </section>
  );
}

export default ResumeAnalysis;
