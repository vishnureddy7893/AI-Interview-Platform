import api from "@/config/api";

export const getRecruiters = () =>
  api.get("/team").then((res) => res.data);

export const getPendingInvitations = () =>
  api.get("/team/invitations").then((res) => res.data);

export const inviteRecruiter = (data) =>
  api.post("/team/invite", data).then((res) => res.data);

export const updateRecruiter = (id, data) =>
  api.put(`/team/${id}`, data).then((res) => res.data);

export const updateRecruiterStatus = (id, isActive) =>
  api.patch(`/team/${id}/status`, { isActive }).then((res) => res.data);

export const deleteRecruiter = (id) =>
  api.delete(`/team/${id}`).then((res) => res.data);