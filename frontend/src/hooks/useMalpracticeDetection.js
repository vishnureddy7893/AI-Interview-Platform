import { useCallback, useEffect, useRef, useState } from "react";

import { reportMalpracticeEvent } from "@/services/assessmentService";

const DEFAULT_MESSAGES = {
  TAB_SWITCH: "You switched tabs during the assessment.",
  WINDOW_BLUR: "The assessment window lost focus.",
  FULLSCREEN_EXIT: "You exited fullscreen mode.",
  COPY: "Copy action detected.",
  PASTE: "Paste action detected.",
  RIGHT_CLICK: "Right-click is disabled during the assessment.",
  DEVTOOLS_OPEN: "Developer tools activity detected.",
  IDLE: "You were idle for too long.",
  KEYBOARD_SHORTCUT: "A restricted keyboard shortcut was used.",
};

/**
 * Phase-1 malpractice detection for coding assessments.
 * Event detection + reporting only (no webcam / mic / screen capture).
 */
export function useMalpracticeDetection({
  assessmentId,
  enabled = true,
  warningLimit = 3,
  idleTimeoutSeconds = 60,
  onWarning,
  onLimitReached,
  onAutoSubmit,
}) {
  const [warning, setWarning] = useState(null);
  const [report, setReport] = useState(null);
  const reportingRef = useRef(false);
  const lastIdleAtRef = useRef(Date.now());
  const closedRef = useRef(false);
  const debounceRef = useRef({});

  const emit = useCallback(
    async (type, details = {}) => {
      if (!enabled || !assessmentId || closedRef.current) return;
      if (reportingRef.current && type === "IDLE") return;

      const key = type;
      const now = Date.now();
      if (debounceRef.current[key] && now - debounceRef.current[key] < 1500) {
        return;
      }
      debounceRef.current[key] = now;

      try {
        reportingRef.current = true;
        const data = await reportMalpracticeEvent(assessmentId, {
          type,
          details,
          timestamp: new Date().toISOString(),
        });

        setReport(data.malpracticeReport);

        const warningPayload = {
          warningNumber: data.malpracticeReport?.warningCount || 1,
          warningLimit: data.warningLimit || warningLimit,
          message: data.message || DEFAULT_MESSAGES[type] || type,
          type,
          limitReached: data.limitReached,
          shouldAutoSubmit: data.shouldAutoSubmit,
        };

        setWarning(warningPayload);
        onWarning?.(warningPayload);

        if (data.shouldAutoSubmit) {
          closedRef.current = true;
          onAutoSubmit?.(data);
        } else if (data.limitReached) {
          onLimitReached?.(data);
        }
      } catch (error) {
        console.error("[malpractice]", error?.response?.data || error.message);
      } finally {
        reportingRef.current = false;
      }
    },
    [
      assessmentId,
      enabled,
      warningLimit,
      onWarning,
      onLimitReached,
      onAutoSubmit,
    ]
  );

  const dismissWarning = useCallback(() => setWarning(null), []);

  const markClosed = useCallback(() => {
    closedRef.current = true;
  }, []);

  const bumpActivity = useCallback(() => {
    lastIdleAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled || !assessmentId) return undefined;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        emit("TAB_SWITCH", { visibilityState: "hidden" });
      } else {
        bumpActivity();
      }
    };

    const onBlur = () => {
      // Tab switches are covered by visibilitychange
      if (document.visibilityState === "hidden") return;
      emit("WINDOW_BLUR", { source: "window.blur" });
    };

    const onFocus = () => bumpActivity();

    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        emit("FULLSCREEN_EXIT", {});
      } else {
        bumpActivity();
      }
    };

    const onCopy = (event) => {
      emit("COPY", { selectionLength: String(window.getSelection() || "").length });
      event.preventDefault();
    };

    const onPaste = (event) => {
      emit("PASTE", {});
      event.preventDefault();
    };

    const onContextMenu = (event) => {
      event.preventDefault();
      emit("RIGHT_CLICK", {});
    };

    const onKeyDown = (event) => {
      bumpActivity();
      const key = event.key?.toLowerCase?.() || "";
      const ctrl = event.ctrlKey || event.metaKey;

      if (ctrl && key === "c") {
        event.preventDefault();
        emit("COPY", { via: "keyboard", shortcut: "Ctrl+C" });
        return;
      }
      if (ctrl && key === "v") {
        event.preventDefault();
        emit("PASTE", { via: "keyboard", shortcut: "Ctrl+V" });
        return;
      }
      if (ctrl && event.shiftKey && key === "i") {
        event.preventDefault();
        emit("DEVTOOLS_OPEN", { shortcut: "Ctrl+Shift+I" });
        return;
      }
      if (key === "f12") {
        event.preventDefault();
        emit("DEVTOOLS_OPEN", { shortcut: "F12" });
        return;
      }
      if (ctrl && key === "u") {
        event.preventDefault();
        emit("DEVTOOLS_OPEN", { shortcut: "Ctrl+U" });
      }
    };

    // Best-effort DevTools detection via threshold on outer/inner size gap
    const detoolsInterval = window.setInterval(() => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      if (widthGap > 160 || heightGap > 160) {
        emit("DEVTOOLS_OPEN", {
          method: "dimension-threshold",
          widthGap,
          heightGap,
        });
      }
    }, 2500);

    const idleMs = Math.max(15, Number(idleTimeoutSeconds) || 60) * 1000;
    const idleInterval = window.setInterval(() => {
      if (Date.now() - lastIdleAtRef.current >= idleMs) {
        emit("IDLE", { idleTimeoutSeconds });
        lastIdleAtRef.current = Date.now();
      }
    }, 5000);

    const onPointer = () => bumpActivity();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousemove", onPointer);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", bumpActivity);

    return () => {
      window.clearInterval(detoolsInterval);
      window.clearInterval(idleInterval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousemove", onPointer);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", bumpActivity);
    };
  }, [enabled, assessmentId, idleTimeoutSeconds, emit, bumpActivity]);

  return {
    warning,
    report,
    dismissWarning,
    markClosed,
    bumpActivity,
    emit,
  };
}

export default useMalpracticeDetection;
