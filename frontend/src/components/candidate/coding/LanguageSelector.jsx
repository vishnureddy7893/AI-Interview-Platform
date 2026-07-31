const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "c", label: "C" },
];

function LanguageSelector({ value, onChange, allowedLabels }) {
  const allowed = Array.isArray(allowedLabels) && allowedLabels.length
    ? LANGUAGES.filter((lang) =>
        allowedLabels.some(
          (label) =>
            String(label).toLowerCase().includes(lang.label.toLowerCase()) ||
            lang.label.toLowerCase().includes(String(label).toLowerCase())
        )
      )
    : LANGUAGES;

  const options = allowed.length ? allowed : LANGUAGES;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100 outline-none focus:border-slate-500"
      aria-label="Language"
    >
      {options.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector;
