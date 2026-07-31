import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getResume } from "@/services/candidateService";
import { formatUploadDate } from "@/lib/profileCompletion";

function ResumeStatusCard({ onNavigate }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getResume();
        if (mounted) setResume(data.resume || null);
      } catch (error) {
        if (mounted) {
          if (error.response?.status !== 404) {
            toast.error(
              error.response?.data?.message || "Could not load resume status"
            );
          }
          setResume(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-green-50 p-3 text-green-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {loading
                  ? "Checking resume…"
                  : resume
                    ? "Resume Uploaded"
                    : "Upload Resume"}
              </h2>
              <p className="mt-2 text-slate-500">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading status
                  </span>
                ) : resume ? (
                  <>
                    Uploaded{" "}
                    <span className="font-medium text-slate-700">
                      {formatUploadDate(resume.uploadedAt)}
                    </span>
                    {resume.originalName ? (
                      <>
                        {" "}
                        ·{" "}
                        <span className="break-all text-slate-600">
                          {resume.originalName}
                        </span>
                      </>
                    ) : null}
                  </>
                ) : (
                  "Add a PDF resume to improve profile completion and job matching."
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!resume ? (
              <Button
                className="rounded-xl bg-black hover:bg-neutral-800"
                onClick={() => onNavigate?.("resume")}
                disabled={loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    window.open(
                      resume.previewUrl || resume.downloadUrl,
                      "_blank"
                    )
                  }
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = resume.downloadUrl || resume.previewUrl;
                    link.download =
                      resume.originalName || resume.filename;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  className="rounded-xl bg-black hover:bg-neutral-800"
                  onClick={() => onNavigate?.("resume")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Replace
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResumeStatusCard;
