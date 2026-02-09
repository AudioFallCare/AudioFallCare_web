import axios from "axios";

// 🔥 배포/로컬에서 환경변수 제대로 먹는지 확인용 로그
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

const api = axios.create({
  // 👉 env 안 먹을 때를 대비한 fallback까지 같이 둠
  baseURL: import.meta.env.VITE_API_URL || "https://audiofallcare-was-test.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
