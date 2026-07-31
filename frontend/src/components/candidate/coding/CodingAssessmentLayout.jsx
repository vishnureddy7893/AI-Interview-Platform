import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import MalpracticeWarningModal from "@/components/candidate/MalpracticeWarningModal";
import { useMalpracticeDetection } from "@/hooks/useMalpracticeDetection";

import AssessmentFooter from "./AssessmentFooter";
import AssessmentHeader from "./AssessmentHeader";
import ConsolePanel from "./ConsolePanel";
import EditorPane from "./EditorPane";
import ProblemPanel from "./ProblemPanel";
import TestCasePanel from "./TestCasePanel";
import Toolbar from "./Toolbar";
import {
  CODE_TEMPLATES,
  buildPlaceholderProblem,
  mapRoundLanguageToId,
} from "./codingDefaults";
import { runCode as runCodeRequest } from "@/services/assessmentService";

function BottomChrome({
  activeTab,
  onTabChange,
  onFinish,
  finishing,
  height,
  onResizeStart,
  tests,
  consoleState,
}) {
  return (
    <div
      className="flex shrink-0 flex-col border-t border-slate-800 bg-[#0f1419]"
      style={{ height }}
    >
      <div
        role="separator"
        aria-orientation="horizontal"
        onMouseDown={onResizeStart}
        className="group flex h-2 cursor-row-resize items-center justify-center hover:bg-slate-800"
      >
        <div className="h-0.5 w-10 rounded-full bg-slate-600 group-hover:bg-slate-400" />
      </div>
      <AssessmentFooter
        activeTab={activeTab}
        onTabChange={onTabChange}
        onFinish={onFinish}
        finishing={finishing}
      >
        {activeTab === "console" ? (
          <ConsolePanel
            status={consoleState.status}
            stdout={consoleState.stdout}
            stderr={consoleState.stderr}
            compileOutput={consoleState.compileOutput}
            executionTime={consoleState.time}
            memoryUsage={consoleState.memory}
            running={consoleState.running}
          />
        ) : null}
        {activeTab === "tests" ? <TestCasePanel tests={tests} /> : null}
        {activeTab === "results" ? (
          <div className="h-full overflow-y-auto px-4 py-3 text-sm text-slate-400">
            Test results placeholder — pass/fail details will appear after
            execution is connected.
          </div>
        ) : null}
      </AssessmentFooter>
    </div>
  );
}

function CodingAssessmentLayout({
  application,
  round,
  assessmentId,
  settings,
  submitting,
  onFinish,
  onExit,
}) {
  const problem = buildPlaceholderProblem({
    settings,
    job: application?.job,
    company: application?.company,
    round,
  });

  const initialLang = mapRoundLanguageToId(
    (settings?.language || problem.allowedLanguages || [])[0]
  );

  const [language, setLanguage] = useState(initialLang);
  const [codeByLang, setCodeByLang] = useState(() => ({ ...CODE_TEMPLATES }));
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [leftWidth, setLeftWidth] = useState(40);
  const [bottomHeight, setBottomHeight] = useState(200);
  const [bottomTab, setBottomTab] = useState("console");
  const [running, setRunning] = useState(false);
  const [consoleState, setConsoleState] = useState({
    status: "idle",
    stdout: "",
    stderr: "",
    compileOutput: "",
    time: null,
    memory: null,
    running: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement)
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    (Number(settings?.duration) || problem.timeLimitMinutes || 60) * 60
  );

  const splitRef = useRef(null);
  const bodyRef = useRef(null);
  const autoSubmitLock = useRef(false);
  const dragging = useRef(null);

  const { warning, report, dismissWarning, markClosed } =
    useMalpracticeDetection({
      assessmentId,
      enabled: Boolean(assessmentId) && !submitting,
      warningLimit: settings?.warningLimit ?? 3,
      idleTimeoutSeconds: settings?.idleTimeoutSeconds ?? 60,
      onAutoSubmit: () => {
        if (autoSubmitLock.current) return;
        autoSubmitLock.current = true;
        markClosed();
        onFinish?.({ auto: true });
      },
    });

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const onLanguageChange = (next) => {
    setLanguage(next);
    setCodeByLang((prev) => ({
      ...prev,
      [next]: prev[next] ?? CODE_TEMPLATES[next] ?? "",
    }));
  };

  const handleReset = () => {
    setCodeByLang((prev) => ({
      ...prev,
      [language]: CODE_TEMPLATES[language] || "",
    }));
    toast.success("Code reset to starter template");
  };

  const handleRunCode = async () => {
    if (running) return;
    const sourceCode = codeByLang[language] ?? "";
    if (!String(sourceCode).trim()) {
      toast.error("Write some code before running");
      return;
    }

    setBottomTab("console");
    setRunning(true);
    setConsoleState((prev) => ({
      ...prev,
      status: "Running",
      running: true,
      stdout: "",
      stderr: "",
      compileOutput: "",
      time: null,
      memory: null,
    }));

    try {
      const data = await runCodeRequest({
        language,
        sourceCode,
        stdin: "",
      });
      setConsoleState({
        status: data.status || "Accepted",
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        compileOutput: data.compileOutput || "",
        time: data.time ?? null,
        memory: data.memory ?? null,
        running: false,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to run code";
      toast.error(message);
      setConsoleState({
        status: "Runtime Error",
        stdout: "",
        stderr: message,
        compileOutput: "",
        time: null,
        memory: null,
        running: false,
      });
    } finally {
      setRunning(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      toast.message("Fullscreen unavailable in this browser");
    }
  };

  const startVerticalDrag = useCallback((event) => {
    event.preventDefault();
    dragging.current = "vertical";
  }, []);

  const startHorizontalDrag = useCallback((event) => {
    event.preventDefault();
    dragging.current = "horizontal";
  }, []);

  useEffect(() => {
    const onMove = (event) => {
      if (!dragging.current) return;
      if (dragging.current === "vertical" && splitRef.current) {
        const rect = splitRef.current.getBoundingClientRect();
        const pct = ((event.clientX - rect.left) / rect.width) * 100;
        setLeftWidth(Math.min(60, Math.max(28, pct)));
      }
      if (dragging.current === "horizontal" && bodyRef.current) {
        const rect = bodyRef.current.getBoundingClientRect();
        const fromBottom = rect.bottom - event.clientY;
        setBottomHeight(Math.min(380, Math.max(140, fromBottom)));
      }
    };
    const onUp = () => {
      dragging.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleFinish = () => {
    markClosed();
    onFinish?.({ auto: false });
  };

  const code = codeByLang[language] ?? "";

  return (
    <div className="flex h-screen min-w-[720px] flex-col overflow-hidden bg-[#0b0f14] text-slate-100">
      <AssessmentHeader
        companyName={problem.companyName}
        companyLogo={problem.companyLogo}
        jobTitle={problem.jobTitle}
        roundTitle={problem.roundTitle}
        questionNumber={problem.questionNumber}
        totalQuestions={problem.totalQuestions}
        remainingSeconds={remainingSeconds}
        warningCount={report?.warningCount || 0}
        warningLimit={settings?.warningLimit ?? 3}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onExit={onExit}
      />

      <div ref={bodyRef} className="flex min-h-0 flex-1 flex-col">
        <div ref={splitRef} className="flex min-h-0 flex-1">
          <div
            className="min-h-0 min-w-0 border-r border-slate-800"
            style={{ width: `${leftWidth}%` }}
          >
            <ProblemPanel problem={problem} />
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={startVerticalDrag}
            className="group relative z-10 w-1.5 shrink-0 cursor-col-resize bg-slate-900 hover:bg-slate-600"
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Toolbar
              language={language}
              onLanguageChange={onLanguageChange}
              allowedLanguages={problem.allowedLanguages}
              theme={theme}
              onThemeChange={setTheme}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              onReset={handleReset}
              onRun={handleRunCode}
              onSubmit={() =>
                toast.message(
                  "Submit Solution will be available after evaluation setup"
                )
              }
              runDisabled={running}
              running={running}
              submitDisabled
              submitting={submitting}
            />
            <div className="min-h-0 flex-1">
              <EditorPane
                language={language}
                value={code}
                onChange={(next) =>
                  setCodeByLang((prev) => ({ ...prev, [language]: next }))
                }
                theme={theme}
                fontSize={fontSize}
              />
            </div>
          </div>
        </div>

        <BottomChrome
          activeTab={bottomTab}
          onTabChange={setBottomTab}
          onFinish={handleFinish}
          finishing={submitting}
          height={bottomHeight}
          onResizeStart={startHorizontalDrag}
          tests={problem.sampleTests}
          consoleState={consoleState}
        />
      </div>

      <MalpracticeWarningModal
        open={Boolean(warning)}
        warning={warning}
        onClose={dismissWarning}
      />
    </div>
  );
}

export default CodingAssessmentLayout;
