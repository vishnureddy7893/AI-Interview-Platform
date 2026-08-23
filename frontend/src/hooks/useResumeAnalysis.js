import { useCallback, useEffect, useRef, useState } from "react";

import {
  getAnalysisStatus,
  getResumeAnalysis,
  parseResume,
} from "@/services/candidateService";

/**
 * Tracks the background resume analysis job.
 *
 * The candidate is never blocked by this hook: analysis starts server-side on
 * upload, and the UI simply reflects whatever state the job is in. While a job
 * is running we poll the cheap status endpoint; when it finishes we fetch the
 * parsed payload once. Polling stops as soon as the job settles, when the tab
 * is hidden, and when the component unmounts — an idle dashboard must not sit
 * there hitting the API forever.
 */

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 5 * 60 * 1000;

const IN_PROGRESS = new Set(["uploaded", "processing"]);

export function useResumeAnalysis(hasResume) {
  const [status, setStatus] = useState(hasResume ? "loading" : "idle");
  const [analysis, setAnalysis] = useState(null);
  const [message, setMessage] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const [loading, setLoading] = useState(Boolean(hasResume));

  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const mountedRef = useRef(true);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const applyStatus = useCallback((payload) => {
    if (!mountedRef.current || !payload) return null;
    setStatus(payload.status);
    setMessage(payload.message || "");
    setCanRetry(Boolean(payload.canRetry));
    return payload.status;
  }, []);

  const loadAnalysis = useCallback(async () => {
    try {
      const data = await getResumeAnalysis();
      if (!mountedRef.current) return;
      setAnalysis(data.parsedResume || null);
      applyStatus(data.analysis);
    } catch {
      // A failed read here is not actionable for the candidate — the status
      // poll will report the real job state on its next tick.
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [applyStatus]);

  const poll = useCallback(async () => {
    if (!mountedRef.current) return;

    if (document.visibilityState === "hidden") {
      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      return;
    }

    try {
      const data = await getAnalysisStatus();
      const next = applyStatus(data.analysis);

      if (next === "completed") {
        await loadAnalysis();
        return;
      }

      if (next === "failed") {
        setLoading(false);
        return;
      }
    } catch {
      // Transient network error — keep polling until the deadline.
    }

    if (Date.now() - startedAtRef.current > MAX_POLL_MS) {
      if (mountedRef.current) setLoading(false);
      return;
    }

    timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, [applyStatus, loadAnalysis]);

  const startPolling = useCallback(() => {
    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, [poll]);

  // Initial load.
  useEffect(() => {
    mountedRef.current = true;

    if (!hasResume) {
      setStatus("idle");
      setAnalysis(null);
      setMessage("");
      setLoading(false);
      return () => {
        mountedRef.current = false;
        clearTimer();
      };
    }

    setLoading(true);

    getResumeAnalysis()
      .then((data) => {
        if (!mountedRef.current) return;
        setAnalysis(data.parsedResume || null);
        const next = applyStatus(data.analysis);
        if (IN_PROGRESS.has(next)) startPolling();
      })
      .catch(() => {
        if (mountedRef.current) setStatus("idle");
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    return () => {
      mountedRef.current = false;
      clearTimer();
    };
  }, [hasResume, applyStatus, startPolling]);

  /** Called after an upload/replace response that already carries a status. */
  const trackFromResponse = useCallback(
    (payload) => {
      const next = applyStatus(payload);
      setAnalysis(null);
      if (IN_PROGRESS.has(next)) startPolling();
    },
    [applyStatus, startPolling]
  );

  /** Explicit "Try again" after a failure. */
  const retry = useCallback(async () => {
    setStatus("processing");
    setMessage("Your resume is being analyzed. You can continue completing your profile.");
    setCanRetry(false);

    try {
      const data = await parseResume();
      applyStatus(data.analysis);
      startPolling();
      return { ok: true };
    } catch (error) {
      const payload = error.response?.data;
      const text = payload?.message || "Couldn't start the analysis. Please try again.";
      setStatus("failed");
      setMessage(text);
      setCanRetry(payload?.retryable !== false);
      return { ok: false, message: text };
    }
  }, [applyStatus, startPolling]);

  return {
    status,
    analysis,
    message,
    canRetry,
    loading,
    inProgress: IN_PROGRESS.has(status),
    retry,
    trackFromResponse,
    refresh: loadAnalysis,
  };
}

export default useResumeAnalysis;
