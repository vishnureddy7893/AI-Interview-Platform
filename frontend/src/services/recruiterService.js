import api from "@/config/api";

export const recruiterRegister = async (data) => {
  const response = await api.post(
    "/recruiter/register",
    data
  );

  return response.data;
};

export const recruiterLogin = async (data) => {
  const response = await api.post(
    "/recruiter/login",
    data
  );

  return response.data;
};