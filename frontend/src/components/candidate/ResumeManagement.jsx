import { useEffect, useRef, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteResume,
  getResume,
  replaceResume,
  uploadResume,
} from "@/services/candidateService";
import { formatFileSize, formatUploadDate } from "@/lib/profileCompletion";
import ResumeAnalysis from "@/components/candidate/ResumeAnalysis";
import ResumeAnalysisStatus from "@/components/candidate/ResumeAnalysisStatus";
import useResumeAnalysis from "@/hooks/useResumeAnalysis";

const MAX_BYTES = 5 * 1024 * 1024;

function ResumeManagement({ onResumeChange }) {
  const inputRef = useRef(null);
  const onResumeChangeRef = useRef(onResumeChange);

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const analysisState = useResumeAnalysis(Boolean(resume));

  useEffect(() => {
    onResumeChangeRef.current = onResumeChange;
  }, [onResumeChange]);

  useEffect(() => {
    let mounted = true;

    const loadResume = async () => {
      try {
        setLoading(true);
        const data = await getResume();
        if (!mounted) return;
        setResume(data.resume || null);
        onResumeChangeRef.current?.(data.resume || null);
      } catch (error) {
        if (!mounted) return;
        if (error.response?.status === 404) {
          setResume(null);
          onResumeChangeRef.current?.(null);
        } else {
          toast.error(
            error.response?.data?.message || "Couldn't load your resume."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadResume();

    return () => {
      mounted = false;
    };
  }, []);

  const validateFile = (file) => {
    if (!file) {
      toast.error("Choose a PDF file to upload.");
      return false;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.error("Resumes must be PDF files.");
      return false;
    }

    if (file.size > MAX_BYTES) {
      toast.error("That file is over 5 MB. Please upload a smaller PDF.");
      return false;
    }

    return true;
  };

  const handleFile = async (file) => {
    if (!validateFile(file)) return;

    try {
      setUploading(true);
      setProgress(0);

      const onUploadProgress = (event) => {
        if (!event.total) return;
        setProgress(Math.round((event.loaded * 100) / event.total));
      };

      const data =
        replaceMode || resume
          ? await replaceResume(file, onUploadProgress)
          : await uploadResume(file, onUploadProgress);

      setResume(data.resume);
      onResumeChangeRef.current?.(data.resume);
      setReplaceMode(false);

      // Analysis has already been queued server-side — start following it.
      analysisState.trackFromResponse(data.analysis);

      toast.success("Resume saved. We're analysing it in the background.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Upload failed. Check your connection and try again."
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDelete = async () => {
    if (!resume) return;

    try {
      setDeleting(true);
      await deleteResume();
      setResume(null);
      onResumeChangeRef.current?.(null);
      setConfirmDelete(false);
      toast.success("Resume deleted.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Couldn't delete your resume."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRetryAnalysis = async () => {
    setRetrying(true);
    const result = await analysisState.retry();
    setRetrying(false);
    if (!result.ok) toast.error(result.message);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your resume…
        </CardContent>
      </Card>
    );
  }

  const showUploader = !resume || replaceMode;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Resume
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a PDF (max 5 MB). Recruiters use this when they screen your
          applications.
        </p>
      </header>

      {showUploader ? (
        <Card>
          <CardContent className="p-6">
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-muted"
                  : "border-border bg-muted/30"
              }`}
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <h2 className="mt-3 text-sm font-medium text-foreground">
                {replaceMode
                  ? "Upload a replacement PDF"
                  : "Drag your resume here"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF only, up to 5 MB
              </p>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={onInputChange}
                disabled={uploading}
              />

              <Button
                type="button"
                className="mt-5"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading {progress}%
                  </>
                ) : (
                  "Choose file"
                )}
              </Button>

              {uploading ? (
                <div className="mt-5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : null}

              {replaceMode ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  disabled={uploading}
                  onClick={() => setReplaceMode(false)}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-md border border-border bg-muted/50 p-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {resume.originalName || resume.filename}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatFileSize(resume.size)} · Uploaded{" "}
                  {formatUploadDate(resume.uploadedAt)}
                </p>
              </div>
            </div>

            <ResumeAnalysisStatus
              status={analysisState.status}
              message={analysisState.message}
              canRetry={analysisState.canRetry}
              retrying={retrying}
              onRetry={handleRetryAnalysis}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    resume.previewUrl || resume.downloadUrl,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = resume.downloadUrl || resume.previewUrl;
                  link.download = resume.originalName || resume.filename;
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
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => {
                  setReplaceMode(true);
                  setTimeout(() => inputRef.current?.click(), 0);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Replace
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={uploading || deleting}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={onInputChange}
              disabled={uploading}
            />
          </CardContent>
        </Card>
      )}

      {resume && !replaceMode ? (
        <ResumeAnalysis hasResume analysisState={analysisState} />
      ) : null}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
            <AlertDialogDescription>
              Your resume and the details we extracted from it will be removed.
              Applications you have already submitted are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete resume"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ResumeManagement;
