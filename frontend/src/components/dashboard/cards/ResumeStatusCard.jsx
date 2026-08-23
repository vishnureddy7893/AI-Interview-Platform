import { useEffect, useState } from "react";
import { Download, Eye, FileText, Loader2, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getResume } from "@/services/candidateService";
import { formatUploadDate } from "@/lib/profileCompletion";
import ResumeAnalysisStatus from "@/components/candidate/ResumeAnalysisStatus";
import useResumeAnalysis from "@/hooks/useResumeAnalysis";

/**
 * Dashboard summary of the candidate's resume and its analysis state.
 * Read-only: every action routes to the Resume page rather than duplicating
 * upload logic here.
 */
function ResumeStatusCard({ onNavigate }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const analysisState = useResumeAnalysis(Boolean(resume));

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getResume();
        if (mounted) setResume(data.resume || null);
      } catch (error) {
        if (!mounted) return;
        if (error.response?.status !== 404) {
          toast.error("Couldn't check your resume status.");
        }
        setResume(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    const result = await analysisState.retry();
    setRetrying(false);
    if (!result.ok) toast.error(result.message);
  };

  const openResume = () =>
    window.open(
      resume.previewUrl || resume.downloadUrl,
      "_blank",
      "noopener,noreferrer"
    );

  const downloadResume = () => {
    const link = document.createElement("a");
    link.href = resume.downloadUrl || resume.previewUrl;
    link.download = resume.originalName || resume.filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-md border border-border bg-muted/50 p-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">
                {loading ? "Resume" : resume ? "Your resume" : "No resume yet"}
              </h2>

              {loading ? (
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Checking…
                </p>
              ) : resume ? (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {resume.originalName || resume.filename} · uploaded{" "}
                  {formatUploadDate(resume.uploadedAt)}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a PDF so recruiters can screen your applications.
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {!resume ? (
              <Button
                size="sm"
                disabled={loading}
                onClick={() => onNavigate?.("resume")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload resume
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={openResume}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={downloadResume}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button size="sm" onClick={() => onNavigate?.("resume")}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Replace
                </Button>
              </>
            )}
          </div>
        </div>

        {resume ? (
          <ResumeAnalysisStatus
            status={analysisState.status}
            message={analysisState.message}
            canRetry={analysisState.canRetry}
            retrying={retrying}
            onRetry={handleRetry}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

export default ResumeStatusCard;
