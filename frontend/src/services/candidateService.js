import api from "@/config/api";

export const candidateLogin = async (data) => {
  const response = await api.post("/candidate/login", data);
  return response.data;
};

export const candidateRegister = async (data) => {
  const response = await api.post("/candidate/register", data);
  return response.data;
};