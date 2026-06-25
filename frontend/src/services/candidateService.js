import api from "@/config/api";

export const loginCandidate = (data) =>
  api.post("/candidate/login", data).then((res) => res.data);

export const registerCandidate = (data) =>
  api.post("/candidate/register", data).then((res) => res.data);

// TODO: Remove aliases after all frontend imports are migrated
export const candidateLogin = loginCandidate;
export const candidateRegister = registerCandidate;
