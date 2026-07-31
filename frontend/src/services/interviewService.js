import api from "@/config/api";

export const listInterviewJobs = () =>
  api.get("/job/published").then((res) => res.data);

export const getInterviewPreview = (jobId) =>
  api.get(`/interview/preview/${jobId}`).then((res) => res.data);

export const generateInterview = (jobId) =>
  api.post("/interview/generate", { jobId }).then((res) => res.data);

export const getInterview = (interviewId, { start = false } = {}) =>
  api
    .get(`/interview/${interviewId}`, {
      params: start ? { start: true } : undefined,
    })
    .then((res) => res.data);

export const submitAnswer = (interviewId, payload) =>
  api
    .post(`/interview/${interviewId}/answer`, payload)
    .then((res) => res.data);

export const nextQuestion = (interviewId) =>
  api.post(`/interview/${interviewId}/next`).then((res) => res.data);

export const completeInterview = (interviewId) =>
  api.post(`/interview/${interviewId}/complete`).then((res) => res.data);

export const listCompanyInterviews = () =>
  api.get("/interview/company/list").then((res) => res.data);

export const getCompanyInterview = (interviewId) =>
  api.get(`/interview/company/${interviewId}`).then((res) => res.data);
