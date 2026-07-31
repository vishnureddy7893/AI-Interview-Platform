/**
 * Profile completion — mirrors the existing candidate dashboard weighting
 * (personal / academic / projects / certifications / resume = 20% each).
 */
export const PROFILE_COMPLETION_WEIGHTS = {
  personal: 20,
  academic: 20,
  projects: 20,
  certifications: 20,
  resume: 20,
};

export function hasResume(candidate) {
  if (!candidate) return false;
  return Boolean(
    candidate.resume?.filename ||
      candidate.resumeUrl
  );
}

export function getProfileCompletion(candidate) {
  if (!candidate) {
    return {
      percentage: 0,
      completed: {},
      nextAction: {
        key: "personal",
        label: "Complete your Personal Details",
        page: "profile",
      },
    };
  }

  const completed = {
    personal: Boolean(
      candidate.name || candidate.parsedResume?.personal?.name
    ),
    academic: Boolean(
      candidate.college ||
        candidate.parsedResume?.education?.[0]?.university
    ),
    projects: Boolean(
      (candidate.projects && candidate.projects.length > 0) ||
        (candidate.parsedResume?.projects &&
          candidate.parsedResume.projects.length > 0)
    ),
    certifications: Boolean(
      (candidate.certifications && candidate.certifications.length > 0) ||
        (candidate.parsedResume?.certifications &&
          candidate.parsedResume.certifications.length > 0)
    ),
    resume: hasResume(candidate),
  };

  const percentage = Object.entries(PROFILE_COMPLETION_WEIGHTS).reduce(
    (total, [key, weight]) =>
      completed[key] ? total + weight : total,
    0
  );

  const nextActionMap = {
    personal: {
      key: "personal",
      label: "Complete your Personal Details",
      page: "profile",
    },
    academic: {
      key: "academic",
      label: "Complete your Academic Details",
      page: "profile",
    },
    projects: {
      key: "projects",
      label: "Add your Projects",
      page: "profile",
    },
    certifications: {
      key: "certifications",
      label: "Add your Certifications",
      page: "profile",
    },
    resume: {
      key: "resume",
      label: "Upload your Resume",
      page: "resume",
    },
  };

  const nextKey =
    Object.keys(nextActionMap).find((key) => !completed[key]) || null;

  return {
    percentage,
    completed,
    nextAction: nextKey
      ? nextActionMap[nextKey]
      : {
          key: "done",
          label: "Your profile looks complete",
          page: "home",
        },
  };
}

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) {
    return "—";
  }

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatUploadDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
