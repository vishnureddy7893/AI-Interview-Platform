import api from "@/config/api";

export const getAssessment = (assessmentId) =>
  api.get(`/assessment/${assessmentId}`).then((res) => res.data);

export const reportMalpracticeEvent = (assessmentId, payload) =>
  api
    .post(`/assessment/${assessmentId}/malpractice`, payload)
    .then((res) => res.data);

export const getMalpracticeReport = (assessmentId) =>
  api
    .get(`/assessment/${assessmentId}/malpractice`)
    .then((res) => res.data);

export const runCode = ({ language, sourceCode, stdin = "" }) =>
  api
    .post("/assessment/run-code", { language, sourceCode, stdin })
    .then((res) => res.data);
