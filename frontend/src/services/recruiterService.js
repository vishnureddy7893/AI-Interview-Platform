import api from "@/config/api";

export const loginRecruiter = (data) =>
  api.post("/recruiter/login", data).then((res) => res.data);

// TODO: Remove alias after all frontend imports are migrated
export const recruiterLogin = loginRecruiter;