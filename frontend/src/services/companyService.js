import api from "@/config/api";

export const registerCompany = (data) =>
  api.post("/company/register", data).then((res) => res.data);

export const loginCompany = (data) =>
  api.post("/company/login", data).then((res) => res.data);

export const getCompanyProfile = () =>
  api.get("/company/profile").then((res) => res.data);