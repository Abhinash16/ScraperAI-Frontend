import { setAuthToken } from "@/service/axios";

export const initializeAuth = () => {
  const token = localStorage.getItem("user-token");
  if (token) {
    setAuthToken(token);
  }
};
