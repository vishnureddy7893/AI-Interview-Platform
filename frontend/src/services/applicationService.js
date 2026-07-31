import api from "@/config/api";

export const applyToJob = (jobId) =>
  api.post("/application/apply", { jobId }).then((res) => res.data);

export const getMyApplications = () =>
  api.get("/application/my").then((res) => res.data);

export const getApplication = (id) =>
  api.get(`/application/${id}`).then((res) => res.data);

export const startApplicationRound = (applicationId, roundId) =>
  api
    .post(`/application/${applicationId}/rounds/start`, { roundId })
    .then((res) => res.data);

export const completeApplicationRound = (applicationId, roundId, score) =>
  api
    .post(`/application/${applicationId}/rounds/${roundId}/complete`, {
      roundId,
      score,
    })
    .then((res) => res.data);

export const listCompanyApplications = () =>
  api.get("/application/company/list").then((res) => res.data);

export const listJobApplications = (jobId) =>
  api.get(`/application/company/job/${jobId}`).then((res) => res.data);

export const getCompanyApplication = (id) =>
  api.get(`/application/company/${id}`).then((res) => res.data);
