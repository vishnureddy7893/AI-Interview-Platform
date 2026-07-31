import api from "@/config/api";

export const loginCandidate = (data) =>
  api.post("/candidate/login", data).then((res) => res.data);

export const registerCandidate = (data) =>
  api.post("/candidate/register", data).then((res) => res.data);

export const getCandidateProfile = (email) =>
  api.get(`/candidate/profile/${encodeURIComponent(email)}`).then(
    (res) => res.data
  );

export const getResume = () =>
  api.get("/candidate/resume").then((res) => res.data);

export const uploadResume = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("resume", file);

  return api
    .post("/candidate/resume", formData, {
      onUploadProgress,
    })
    .then((res) => res.data);
};

export const replaceResume = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("resume", file);

  return api
    .patch("/candidate/resume", formData, {
      onUploadProgress,
    })
    .then((res) => res.data);
};

export const deleteResume = () =>
  api.delete("/candidate/resume").then((res) => res.data);

export const parseResume = () =>
  api.post("/candidate/resume/parse").then((res) => res.data);

export const getResumeAnalysis = () =>
  api.get("/candidate/resume/analysis").then((res) => res.data);

// TODO: Remove aliases after all frontend imports are migrated
export const candidateLogin = loginCandidate;
export const candidateRegister = registerCandidate;
