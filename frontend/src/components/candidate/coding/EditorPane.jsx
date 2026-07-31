import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

import { SUPPORTED_LANGUAGES } from "./codingDefaults";

function disableEditorIntelligence(editor, monaco) {
  // Turn off JS/TS language-service completions & diagnostics noise
  try {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });
  } catch {
    // Non-TS languages ignore these defaults
  }

  editor.updateOptions({
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    parameterHints: { enabled: false },
    hover: { enabled: false },
    snippetSuggestions: "none",
    wordBasedSuggestions: "off",
    inlineSuggest: { enabled: false },
  });
}

function EditorPane({
  language,
  value,
  onChange,
  theme = "vs-dark",
  fontSize = 14,
  onMount,
}) {
  const langMeta =
    SUPPORTED_LANGUAGES.find((l) => l.id === language) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative h-full min-h-0 bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={langMeta.monaco}
        theme={theme === "light" ? "light" : "vs-dark"}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        onMount={(editor, monaco) => {
          disableEditorIntelligence(editor, monaco);
          onMount?.(editor, monaco);
        }}
        loading={
          <div className="flex h-full items-center justify-center gap-2 bg-[#1e1e1e] text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading editor…
          </div>
        }
        options={{
          fontSize,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          lineNumbers: "on",
          matchBrackets: "always",
          autoIndent: "full",
          folding: true,
          formatOnPaste: false,
          formatOnType: false,
          renderLineHighlight: "line",
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },

          // Assessment mode — no IntelliSense / completions
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnCommitCharacter: false,
          acceptSuggestionOnEnter: "off",
          tabCompletion: "off",
          wordBasedSuggestions: "off",
          parameterHints: { enabled: false },
          hover: { enabled: false },
          snippetSuggestions: "none",
          suggest: {
            showMethods: false,
            showFunctions: false,
            showConstructors: false,
            showDeprecated: false,
            showFields: false,
            showVariables: false,
            showClasses: false,
            showStructs: false,
            showInterfaces: false,
            showModules: false,
            showProperties: false,
            showEvents: false,
            showOperators: false,
            showUnits: false,
            showValues: false,
            showConstants: false,
            showEnums: false,
            showEnumMembers: false,
            showKeywords: false,
            showWords: false,
            showColors: false,
            showFiles: false,
            showReferences: false,
            showFolders: false,
            showTypeParameters: false,
            showSnippets: false,
            showUsers: false,
            showIssues: false,
          },
          inlineSuggest: { enabled: false },
          codeLens: false,
          lightbulb: { enabled: false },
          inlayHints: { enabled: "off" },
          contextmenu: true,
          links: false,
          colorDecorators: false,
        }}
      />
    </div>
  );
}

export default EditorPane;
