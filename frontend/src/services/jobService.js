import api from "@/config/api";

export const getInterviewTopics = () =>
  api.get("/interview/topics").then((res) => res.data);

export const createJob = (data) =>
  api.post("/job/create", data).then((res) => res.data);

export const getJob = (id) =>
  api.get(`/job/${id}`).then((res) => res.data);

export const listJobs = () =>
  api.get("/job").then((res) => res.data);

export const updateJobWorkflow = (id, interviewWorkflow) =>
  api
    .patch(`/job/${id}/workflow`, { interviewWorkflow })
    .then((res) => res.data);
