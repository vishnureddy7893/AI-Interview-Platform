import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Loader2,
  Trash2,
  Upload,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteResume,
  getResume,
  replaceResume,
  uploadResume,
} from "@/services/candidateService";
import {
  formatFileSize,
  formatUploadDate,
} from "@/lib/profileCompletion";
import ResumeAnalysis from "@/components/candidate/ResumeAnalysis";

const MAX_BYTES = 5 * 1024 * 1024;

function ResumeManagement({ onResumeChange }) {
  const inputRef = useRef(null);
  const onResumeChangeRef = useRef(onResumeChange);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);

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
            error.response?.data?.message || "Failed to load resume"
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

  const notifyResumeChange = (value) => {
    onResumeChangeRef.current?.(value);
  };

  const validateFile = (file) => {
    if (!file) {
      toast.error("Please select a PDF file");
      return false;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.error("Only PDF files are allowed");
      return false;
    }

    if (file.size > MAX_BYTES) {
      toast.error("File size must be 5 MB or less");
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
      notifyResumeChange(data.resume);
      setReplaceMode(false);
      toast.success(data.message || "Resume saved successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Resume upload failed"
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
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

    const confirmed = window.confirm(
      "Delete your resume? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      setUploading(true);
      await deleteResume();
      setResume(null);
      notifyResumeChange(null);
      toast.success("Resume deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete resume"
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-3xl border border-gray-200 shadow-sm">
        <CardContent className="flex items-center justify-center gap-3 p-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading resume…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Resume</h1>
        <p className="mt-2 text-slate-500">
          Upload a PDF resume (max 5 MB). Recruiters use this for screening.
        </p>
      </div>

      {!resume || replaceMode ? (
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
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
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
                dragActive
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                <Upload className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                {replaceMode ? "Replace your resume" : "Drag & drop your PDF"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                or browse from your device
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
                className="mt-6 rounded-xl bg-black px-6 hover:bg-neutral-800"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading… {progress}%
                  </>
                ) : (
                  "Browse File"
                )}
              </Button>

              {uploading && (
                <div className="mt-6 w-full max-w-md">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {replaceMode && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-4"
                  disabled={uploading}
                  onClick={() => setReplaceMode(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <FileText className="h-6 w-6 text-green-600" />
              Resume Uploaded
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  File name
                </p>
                <p className="mt-2 break-all font-medium text-slate-800">
                  {resume.originalName || resume.filename}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Uploaded
                </p>
                <p className="mt-2 font-medium text-slate-800">
                  {formatUploadDate(resume.uploadedAt)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Size
                </p>
                <p className="mt-2 font-medium text-slate-800">
                  {formatFileSize(resume.size)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-xl"
                variant="outline"
                onClick={() =>
                  window.open(resume.previewUrl || resume.downloadUrl, "_blank")
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                className="rounded-xl"
                variant="outline"
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
                className="rounded-xl bg-black hover:bg-neutral-800"
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
                className="rounded-xl"
                variant="destructive"
                disabled={uploading}
                onClick={handleDelete}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
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
        <ResumeAnalysis
          hasResume={Boolean(resume)}
          onParsed={() => notifyResumeChange(resume)}
        />
      ) : null}
    </div>
  );
}

export default ResumeManagement;
